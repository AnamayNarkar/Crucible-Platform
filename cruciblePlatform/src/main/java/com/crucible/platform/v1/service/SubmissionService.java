package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import com.crucible.platform.v1.client.PistonClient;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.submission.ContestSubmitCodeRequest;
import com.crucible.platform.v1.dto.submission.PistonExecuteRequest;
import com.crucible.platform.v1.dto.submission.PistonExecuteResponse;
import com.crucible.platform.v1.dto.submission.SubmissionResponse;
import com.crucible.platform.v1.dto.submission.SubmitCodeRequest;
import com.crucible.platform.v1.dto.submission.TestCaseResult;
import com.crucible.platform.v1.entity.Question;
import com.crucible.platform.v1.entity.Submission;
import com.crucible.platform.v1.entity.TestCase;
import com.crucible.platform.v1.entity.UserContest;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.exceptions.ForbiddenException;
import com.crucible.platform.v1.exceptions.NotFoundException;
import com.crucible.platform.v1.repository.QuestionRepository;
import com.crucible.platform.v1.repository.SubmissionRepository;
import com.crucible.platform.v1.repository.TestCaseRepository;
import com.crucible.platform.v1.repository.UserContestRepository;
import com.crucible.platform.v1.repository.ContestRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SubmissionService {
    
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserContestRepository userContestRepository;
    private final ContestRepository contestRepository;
    private final PistonClient pistonClient;

    private static final Logger logger = LoggerFactory.getLogger(SubmissionService.class);

    public SubmissionService(
            SubmissionRepository submissionRepository,
            QuestionRepository questionRepository,
            TestCaseRepository testCaseRepository,
            UserContestRepository userContestRepository,
            ContestRepository contestRepository,
            PistonClient pistonClient) {
        this.submissionRepository = submissionRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.userContestRepository = userContestRepository;
        this.contestRepository = contestRepository;
        this.pistonClient = pistonClient;
    }

    /**
     * Submit code for a regular (public) problem
     */
    public Mono<ResponseEntity<SubmissionResponse>> submitCode(Long userId, SubmitCodeRequest request) {
        return questionRepository.findById(request.getQuestionId())
            .switchIfEmpty(Mono.error(new NotFoundException("Question not found")))
            .flatMap(question -> {
                // Check if question is public
                if (!question.getIsPublic()) {
                    return Mono.error(new ForbiddenException("This question is not public"));
                }
                
                boolean isRun = request.getIsRun() != null && request.getIsRun();
                return processSubmission(userId, null, request.getQuestionId(), 
                    request.getCode(), request.getLanguage(), isRun);
            });
    }

    /**
     * Submit code for a contest problem
     */
    public Mono<ResponseEntity<SubmissionResponse>> submitContestCode(Long userId, ContestSubmitCodeRequest request) {
        return Mono.zip(
            questionRepository.findById(request.getQuestionId())
                .switchIfEmpty(Mono.error(new NotFoundException("Question not found"))),
            contestRepository.findById(request.getContestId())
                .switchIfEmpty(Mono.error(new NotFoundException("Contest not found"))),
            userContestRepository.findByUserIdAndContestId(userId, request.getContestId())
                .switchIfEmpty(Mono.error(new ForbiddenException("You are not registered for this contest")))
        ).flatMap(tuple -> {
            Question question = tuple.getT1();
            Contest contest = tuple.getT2();
            UserContest userContest = tuple.getT3();

            // Verify question belongs to this contest
            if (!question.getContestId().equals(request.getContestId())) {
                return Mono.error(new ForbiddenException("Question does not belong to this contest"));
            }

            // Check if contest is ongoing
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(contest.getStartTime())) {
                return Mono.error(new ForbiddenException("Contest has not started yet"));
            }
            if (now.isAfter(contest.getEndTime())) {
                return Mono.error(new ForbiddenException("Contest has ended"));
            }

            boolean isRun = request.getIsRun() != null && request.getIsRun();
            return processSubmission(userId, request.getContestId(), request.getQuestionId(), 
                request.getCode(), request.getLanguage(), isRun);
        });
    }

    /**
     * Process the submission by executing code and comparing with test cases
     */
    private Mono<ResponseEntity<SubmissionResponse>> processSubmission(
            Long userId, Long contestId, Long questionId, String code, String language, boolean isRun) {
        
        logger.info("Processing submission: userId={}, questionId={}, contestId={}, language={}, isRun={}", 
            userId, questionId, contestId, language, isRun);

        // Create initial submission with "Pending" status
        Submission submission = new Submission();
        logger.debug("Created submission entity with status Pending");
        submission.setUserId(userId);
        submission.setQuestionId(questionId);
        submission.setContestId(contestId);
        submission.setCode(code);
        submission.setLanguage(language);
        submission.setStatus("Pending");
        submission.setCreatedAt(LocalDateTime.now());

        // For run operations, we don't save to database
        if (isRun) {
            logger.info("Handling run operation for user {}", userId);
            return testCaseRepository.findByQuestionId(questionId)
                .filter(TestCase::getIsSample) // Only sample test cases for run
                .collectList()
                .flatMap(testCases -> {
                    if (testCases.isEmpty()) {
                        return createRunResponse("No Sample Test Cases", "", 0, 0, new ArrayList<>());
                    }
                    return executeAndValidate(null, testCases, code, language, true);
                });
        }

        logger.info("Saving submission for user {}", userId);
        return submissionRepository.save(submission)
            .flatMap(savedSubmission -> 
                // Fetch all test cases for the question
                testCaseRepository.findByQuestionId(questionId)
                    .collectList()
                    .flatMap(testCases -> {
                        logger.debug("Fetched {} test cases for question {}", testCases.size(), questionId);
                        if (testCases.isEmpty()) {
                            return updateSubmissionStatus(savedSubmission, "No Test Cases", "", 0, 0, false, new ArrayList<>());
                        }

                        // Execute code against all test cases
                        return executeAndValidate(savedSubmission, testCases, code, language, false);
                    })
            );
    }

    /**
     * Execute code against all test cases and validate results
     */
    private Mono<ResponseEntity<SubmissionResponse>> executeAndValidate(
            Submission submission, List<TestCase> testCases, String code, String language, boolean isRun) {
        
        AtomicInteger passedCount = new AtomicInteger(0);
        AtomicInteger totalCount = new AtomicInteger(testCases.size());
        AtomicInteger testCaseNumber = new AtomicInteger(1);
        StringBuilder outputBuilder = new StringBuilder();
        List<TestCaseResult> testCaseResults = new ArrayList<>();

        // Execute code for each test case
        return Flux.fromIterable(testCases)
            .concatMap(testCase -> executeCodeWithInput(code, language, testCase.getInput())
                .map(response -> {
                    boolean passed = validateOutput(response, testCase.getExpectedOutput());
                    if (passed) {
                        passedCount.incrementAndGet();
                    }
                    
                    // Create test case result
                    TestCaseResult result = new TestCaseResult();
                    result.setTestCaseNumber(testCaseNumber.getAndIncrement());
                    result.setPassed(passed);
                    result.setInput(testCase.getInput());
                    result.setExpectedOutput(testCase.getExpectedOutput());
                    result.setActualOutput(response.getRun() != null && response.getRun().getOutput() != null 
                        ? response.getRun().getOutput().trim() : "");
                    result.setIsSample(testCase.getIsSample());
                    testCaseResults.add(result);
                    
                    // Collect output information
                    if (testCase.getIsSample()) {
                        outputBuilder.append("Test Case (Sample):\n");
                    } else {
                        outputBuilder.append("Test Case:\n");
                    }
                    outputBuilder.append("Expected: ").append(testCase.getExpectedOutput()).append("\n");
                    outputBuilder.append("Got: ").append(result.getActualOutput()).append("\n");
                    outputBuilder.append("Status: ").append(passed ? "PASS" : "FAIL").append("\n\n");
                    
                    return passed;
                })
                .onErrorResume(e -> {
                    // Handle execution errors (Runtime Error, TLE, etc.)
                    TestCaseResult result = new TestCaseResult();
                    result.setTestCaseNumber(testCaseNumber.getAndIncrement());
                    result.setPassed(false);
                    result.setInput(testCase.getInput());
                    result.setExpectedOutput(testCase.getExpectedOutput());
                    result.setErrorMessage(e.getMessage());
                    result.setIsSample(testCase.getIsSample());
                    testCaseResults.add(result);
                    
                    outputBuilder.append("Execution Error: ").append(e.getMessage()).append("\n\n");
                    return Mono.just(false);
                })
            )
            .collectList()
            .flatMap(results -> {
                // Determine final status
                String status;
                if (passedCount.get() == totalCount.get()) {
                    status = "Accepted";
                } else if (passedCount.get() == 0) {
                    status = "Wrong Answer";
                } else {
                    status = "Partial";
                }

                if (isRun) {
                    return createRunResponse(status, outputBuilder.toString(), 
                        passedCount.get(), totalCount.get(), testCaseResults);
                } else {
                    return updateSubmissionStatus(submission, status, outputBuilder.toString(), 
                        passedCount.get(), totalCount.get(), false, testCaseResults);
                }
            });
    }

    /**
     * Execute code with given input using Piston API
     */
    private Mono<PistonExecuteResponse> executeCodeWithInput(String code, String language, String input) {
        PistonExecuteRequest request = new PistonExecuteRequest();
        request.setLanguage(mapLanguageToPiston(language));
        request.setVersion("*"); // Use latest version
        
        List<PistonExecuteRequest.PistonFile> files = new ArrayList<>();
        PistonExecuteRequest.PistonFile file = new PistonExecuteRequest.PistonFile();
        file.setName("main" + getFileExtension(language));
        file.setContent(code);
        files.add(file);
        
        request.setFiles(files);
        request.setStdin(input);
        request.setCompile_timeout(10000); // 10 seconds
        request.setRun_timeout(3000); // 3 seconds
        request.setCompile_memory_limit(-1L); // No limit
        request.setRun_memory_limit(-1L); // No limit

        return pistonClient.executeCode(request);
    }

    /**
     * Validate output against expected output
     */
    private boolean validateOutput(PistonExecuteResponse response, String expectedOutput) {
        if (response.getRun() == null || response.getRun().getOutput() == null) {
            return false;
        }

        // Check for runtime errors
        if (response.getRun().getCode() != null && response.getRun().getCode() != 0) {
            return false;
        }

        String actualOutput = response.getRun().getOutput().trim();
        String expected = expectedOutput.trim();

        return actualOutput.equals(expected);
    }

    /**
     * Update submission with final status and output
     */
    private Mono<ResponseEntity<SubmissionResponse>> updateSubmissionStatus(
            Submission submission, String status, String output, int passedCount, int totalCount, 
            boolean isRun, List<TestCaseResult> testCaseResults) {
        
        submission.setStatus(status);
        submission.setOutput(output);

        return submissionRepository.save(submission)
            .flatMap(updated -> {
                // If this is a contest submission and it's accepted, update user contest stats
                if (updated.getContestId() != null && "Accepted".equals(status)) {
                    return updateUserContestStats(updated.getUserId(), updated.getContestId(),
                            updated.getQuestionId())
                        .then(createSubmissionResponse(updated, passedCount, totalCount, isRun, testCaseResults));
                } else {
                    return createSubmissionResponse(updated, passedCount, totalCount, isRun, testCaseResults);
                }
            });
    }

    /**
     * Create response for run operation (no database save)
     */
    private Mono<ResponseEntity<SubmissionResponse>> createRunResponse(
            String status, String output, int passedCount, int totalCount, List<TestCaseResult> testCaseResults) {
        
        SubmissionResponse response = new SubmissionResponse();
        response.setSubmissionId(null); // No submission ID for run operations
        response.setStatus(status);
        response.setOutput(output);
        response.setPassedTestCases(passedCount);
        response.setTotalTestCases(totalCount);
        response.setIsRun(true);
        response.setTestCaseResults(testCaseResults);

        logger.info("Creating run response with status: {}, passed: {}/{}", status, passedCount, totalCount);
        return Mono.just(new ResponseEntity<>(response, "Code executed successfully"));
    }

    /**
     * Update user contest statistics
     */
    private Mono<Void> updateUserContestStats(Long userId, Long contestId, Long questionId) {
        return userContestRepository.findByUserIdAndContestId(userId, contestId)
            .flatMap(userContest -> {
                // Check if this is a new solved question (count previous accepted submissions)
                return submissionRepository.findByUserIdAndQuestionId(userId, questionId)
                    .filter(s -> "Accepted".equals(s.getStatus()))
                    .count()
                    .flatMap(acceptedCount -> {
                        // Update stats
                        int newTotalSubmissions = userContest.getTotalSubmissions() + 1;
                        LocalDateTime newLastSubmissionAt = LocalDateTime.now();
                        int newSolvedQuestions = userContest.getSolvedQuestions();
                        int newTotalPoints = userContest.getTotalPoints();
                        
                        // If this is the first accepted submission for this question (count includes current one)
                        if (acceptedCount == 1) {
                            return questionRepository.findById(questionId)
                                .flatMap(question -> {
                                    int updatedSolvedQuestions = newSolvedQuestions + 1;
                                    int updatedTotalPoints = newTotalPoints + (question.getPoints() != null ? question.getPoints() : 0);
                                    return userContestRepository.updateUserContestStats(
                                        userId, contestId, updatedSolvedQuestions, newTotalSubmissions, 
                                        updatedTotalPoints, newLastSubmissionAt
                                    );
                                })
                                .then();
                        }
                        return userContestRepository.updateUserContestStats(
                            userId, contestId, newSolvedQuestions, newTotalSubmissions, 
                            newTotalPoints, newLastSubmissionAt
                        ).then();
                    });
            });
    }

    /**
     * Create submission response DTO
     */
    private Mono<ResponseEntity<SubmissionResponse>> createSubmissionResponse(
            Submission submission, int passedCount, int totalCount, boolean isRun, List<TestCaseResult> testCaseResults) {
        
        SubmissionResponse response = new SubmissionResponse();
        response.setSubmissionId(submission.getId());
        response.setStatus(submission.getStatus());
        response.setOutput(submission.getOutput());
        response.setPassedTestCases(passedCount);
        response.setTotalTestCases(totalCount);
        response.setIsRun(isRun);
        response.setTestCaseResults(testCaseResults);

        logger.info("Creating submission response for submissionId: {}, status: {}, passed: {}/{}", 
            submission.getId(), submission.getStatus(), passedCount, totalCount);
        return Mono.just(new ResponseEntity<>(response, "Submission processed successfully"));
    }

    /**
     * Map language names to Piston API language names
     */
    private String mapLanguageToPiston(String language) {
        return switch (language.toLowerCase()) {
            case "javascript", "js" -> "javascript";
            case "python", "python3" -> "python";
            case "java" -> "java";
            case "c" -> "c";
            case "cpp", "c++" -> "cpp";
            case "go" -> "go";
            case "rust" -> "rust";
            case "ruby" -> "ruby";
            case "php" -> "php";
            case "typescript", "ts" -> "typescript";
            default -> language.toLowerCase();
        };
    }

    /**
     * Get file extension for language
     */
    private String getFileExtension(String language) {
        return switch (language.toLowerCase()) {
            case "javascript", "js" -> ".js";
            case "python", "python3" -> ".py";
            case "java" -> ".java";
            case "c" -> ".c";
            case "cpp", "c++" -> ".cpp";
            case "go" -> ".go";
            case "rust" -> ".rs";
            case "ruby" -> ".rb";
            case "php" -> ".php";
            case "typescript", "ts" -> ".ts";
            default -> ".txt";
        };
    }
}
