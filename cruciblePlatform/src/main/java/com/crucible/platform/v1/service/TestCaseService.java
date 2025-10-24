package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;

import com.crucible.platform.v1.dto.testCase.AlterTestCaseDTO;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.entity.TestCase;
import com.crucible.platform.v1.exceptions.ForbiddenException;
import com.crucible.platform.v1.exceptions.NotFoundException;
import com.crucible.platform.v1.repository.ContestAdminRepository;
import com.crucible.platform.v1.repository.ContestRepository;
import com.crucible.platform.v1.repository.QuestionRepository;
import com.crucible.platform.v1.repository.TestCaseRepository;

import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;

@Service
public class TestCaseService {

    private final ContestRepository contestRepository;
    private final ContestAdminRepository contestAdminRepository;
    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;

    public TestCaseService(ContestRepository contestRepository,
                           ContestAdminRepository contestAdminRepository,
                           QuestionRepository questionRepository,
                           TestCaseRepository testCaseRepository) {
        this.contestRepository = contestRepository;
        this.contestAdminRepository = contestAdminRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
    }

    /**
     * Creates a new test case for a question.
     * Authorization is checked against the question's parent contest.
     */
    public Mono<TestCase> createTestCase(AlterTestCaseDTO testCaseDTO, Long creatorId) {

        // Helper function to create and save the test case.
        // This is only called if authorization succeeds.
        Mono<TestCase> saveTestCase = Mono.fromSupplier(() -> {
            TestCase newTestCase = new TestCase(
                    null,
                    testCaseDTO.getQuestionId(),
                    testCaseDTO.getInput(),
                    testCaseDTO.getExpectedOutput(),
                    testCaseDTO.getIsSample(),
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );
            return newTestCase;
        }).flatMap(testCaseRepository::save);

        // 1. Find the question to get its contest ID
        return questionRepository.findById(testCaseDTO.getQuestionId())
                .switchIfEmpty(Mono.error(new NotFoundException("Question not found with ID: " + testCaseDTO.getQuestionId())))
                .flatMap(question -> 
                    // 2. Find the contest for authorization
                    contestRepository.findById(question.getContestId())
                        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found for question")))
                        .flatMap(contest -> 
                            // 3. Perform the authorization check
                            checkPermissions(contest, creatorId, saveTestCase)
                        )
                );
    }

    /**
     * Get all test cases for a question.
     */
    public Mono<Flux<TestCase>> getTestCasesByQuestion(Long questionId, Long userId) {
        // Check authorization first
        return questionRepository.findById(questionId)
                .switchIfEmpty(Mono.error(new NotFoundException("Question not found with ID: " + questionId)))
                .flatMap(question -> 
                    contestRepository.findById(question.getContestId())
                        .switchIfEmpty(Mono.error(new NotFoundException("Contest not found for question")))
                        .flatMap(contest -> {
                            if (contest.getCreatorId().equals(userId)) {
                                return Mono.just(testCaseRepository.findByQuestionId(questionId));
                            }

                            return contestAdminRepository
                                    .findByContestIdAndAdminId(contest.getId(), userId)
                                    .hasElement()
                                    .flatMap(isAdmin -> {
                                        if (isAdmin) {
                                            return Mono.just(testCaseRepository.findByQuestionId(questionId));
                                        } else {
                                            return Mono.error(new ForbiddenException("You are not authorized to view test cases for this question"));
                                        }
                                    });
                        })
                );
    }

    /**
     * Update a test case.
     */
    public Mono<TestCase> updateTestCase(Long testCaseId, AlterTestCaseDTO testCaseDTO, Long userId) {
        return testCaseRepository.findById(testCaseId)
                .switchIfEmpty(Mono.error(new NotFoundException("Test case not found with ID: " + testCaseId)))
                .flatMap(existingTestCase -> 
                    questionRepository.findById(existingTestCase.getQuestionId())
                        .switchIfEmpty(Mono.error(new NotFoundException("Question not found")))
                        .flatMap(question -> 
                            contestRepository.findById(question.getContestId())
                                .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
                                .flatMap(contest -> {
                                    Mono<TestCase> updateOperation = Mono.fromSupplier(() -> {
                                        existingTestCase.setInput(testCaseDTO.getInput());
                                        existingTestCase.setExpectedOutput(testCaseDTO.getExpectedOutput());
                                        existingTestCase.setIsSample(testCaseDTO.getIsSample());
                                        existingTestCase.setUpdatedAt(LocalDateTime.now());
                                        return existingTestCase;
                                    }).flatMap(testCaseRepository::save);

                                    return checkPermissions(contest, userId, updateOperation);
                                })
                        )
                );
    }

    /**
     * Delete a test case.
     */
    public Mono<Void> deleteTestCase(Long testCaseId, Long userId) {
        return testCaseRepository.findById(testCaseId)
                .switchIfEmpty(Mono.error(new NotFoundException("Test case not found with ID: " + testCaseId)))
                .flatMap(testCase -> 
                    questionRepository.findById(testCase.getQuestionId())
                        .switchIfEmpty(Mono.error(new NotFoundException("Question not found")))
                        .flatMap(question -> 
                            contestRepository.findById(question.getContestId())
                                .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
                                .flatMap(contest -> {
                                    if (contest.getCreatorId().equals(userId)) {
                                        return testCaseRepository.deleteById(testCaseId);
                                    }

                                    return contestAdminRepository
                                            .findByContestIdAndAdminId(contest.getId(), userId)
                                            .hasElement()
                                            .flatMap(isAdmin -> {
                                                if (isAdmin) {
                                                    return testCaseRepository.deleteById(testCaseId);
                                                } else {
                                                    return Mono.error(new ForbiddenException("You are not authorized to delete this test case"));
                                                }
                                            });
                                })
                        )
                );
    }

    /**
     * Private helper to check if a user is the contest creator or a contest admin.
     * If authorized, it returns the provided 'saveOperation' Mono.
     * If not, it returns a Mono.error.
     */
    private Mono<TestCase> checkPermissions(Contest contest, Long userId, Mono<TestCase> saveOperation) {
        // 1. Check if the user is the contest creator
        if (contest.getCreatorId().equals(userId)) {
            return saveOperation;
        }

        // 2. If not, check if they are a contest admin
        return contestAdminRepository
                .findByContestIdAndAdminId(contest.getId(), userId)
                .hasElement() // Emits true if an admin entry exists, false otherwise
                .flatMap(isAdmin -> {
                    if (isAdmin) {
                        return saveOperation;
                    } else {
                        // If not creator and not admin, throw Forbidden
                        return Mono.error(new ForbiddenException("You are not authorized to add test cases to this question"));
                    }
                });
    }
}