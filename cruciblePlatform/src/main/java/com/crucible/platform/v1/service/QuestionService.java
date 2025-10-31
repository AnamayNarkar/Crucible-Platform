package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.dto.question.QuestionCreateDTO;
import com.crucible.platform.v1.dto.question.QuestionUpdateDTO;
import com.crucible.platform.v1.dto.question.QuestionWithSamplesDto;
import com.crucible.platform.v1.dto.question.TestCaseDto;
import com.crucible.platform.v1.entity.Question;
import com.crucible.platform.v1.exceptions.ForbiddenException;
import com.crucible.platform.v1.exceptions.NotFoundException;
import com.crucible.platform.v1.repository.ContestAdminRepository;
import com.crucible.platform.v1.repository.ContestRepository;
import com.crucible.platform.v1.repository.QuestionRepository;
import com.crucible.platform.v1.repository.TestCaseRepository;

import java.time.LocalDateTime;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ContestRepository contestRepository;
    private final ContestAdminRepository contestAdminRepository;
    private final TestCaseRepository testCaseRepository;

    public QuestionService(QuestionRepository questionRepository,
                           ContestRepository contestRepository,
                           ContestAdminRepository contestAdminRepository,
                           TestCaseRepository testCaseRepository) {
        this.questionRepository = questionRepository;
        this.contestRepository = contestRepository;
        this.contestAdminRepository = contestAdminRepository;
        this.testCaseRepository = testCaseRepository;
    }

    public Mono<Question> createQuestion(QuestionCreateDTO questionDTO, Long creatorId) {

        Mono<Question> saveQuestion = Mono.fromSupplier(() -> {
            Question newQuestion = new Question(
                    null,
                    questionDTO.getTitle(),
                    questionDTO.getMarkdownDescription(),
                    questionDTO.getPoints(),
                    creatorId,
                    questionDTO.getContestId(),
                    false,
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );
            return newQuestion;
        }).flatMap(questionRepository::save);

        return contestRepository.findById(questionDTO.getContestId())
                .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
                .flatMap(contest -> {
                    if (contest.getCreatorId().equals(creatorId)) {
                        return saveQuestion;
                    }

                    return contestAdminRepository
                            .findByContestIdAndAdminId(contest.getId(), creatorId)
                            .hasElement()
                            .flatMap(isAdmin -> {
                                if (isAdmin) {
                                    return saveQuestion;
                                } else {
                                    return Mono.error(new ForbiddenException("User is not authorized to add questions to this contest"));
                                }
                            });
                });
    }

    public Mono<Question> getQuestion(Long questionId, Long userId) {
        return questionRepository.findById(questionId)
                .switchIfEmpty(Mono.error(new NotFoundException("Question not found")))
                .flatMap(question -> {
                    if (question.getIsPublic()) {
                        return Mono.just(question);
                    }
                    return contestRepository.findById(question.getContestId())
                            .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
                            .flatMap(contest -> {
                                if (LocalDateTime.now().isAfter(contest.getStartTime())) {
                                    return Mono.just(question);
                                }
                                if (contest.getCreatorId().equals(userId)) {
                                    return Mono.just(question);
                                }

                                return contestAdminRepository
                                        .findByContestIdAndAdminId(contest.getId(), userId)
                                        .hasElement()
                                        .flatMap(isAdmin -> {
                                            if (isAdmin) {
                                                return Mono.just(question);
                                            } else {
                                                return Mono.error(new ForbiddenException("User is not authorized to view this question"));
                                            }
                                        });
                            });
                });
    }

    public Mono<QuestionWithSamplesDto> getQuestionWithSamples(Long questionId, Long userId) {
        return getQuestion(questionId, userId)
                .flatMap(question -> 
                    testCaseRepository.findByQuestionIdAndIsSample(questionId, true)
                        .take(3) // Limit to max 3 sample test cases
                        .map(testCase -> new TestCaseDto(
                            testCase.getId(),
                            testCase.getInput(),
                            testCase.getExpectedOutput()
                        ))
                        .collectList()
                        .map(sampleTestCases -> new QuestionWithSamplesDto(question, sampleTestCases))
                );
    }

    public Mono<Question> updateQuestion(Long questionId, QuestionUpdateDTO questionDTO, Long userId) {
        return questionRepository.findById(questionId)
                .switchIfEmpty(Mono.error(new NotFoundException("Question not found")))
                .flatMap(existingQuestion -> {
                    return contestRepository.findById(existingQuestion.getContestId())
                            .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
                            .flatMap(contest -> {
                                if (contest.getCreatorId().equals(userId)) {
                                    return updateQuestionData(existingQuestion, questionDTO);
                                }

                                return contestAdminRepository
                                        .findByContestIdAndAdminId(contest.getId(), userId)
                                        .hasElement()
                                        .flatMap(isAdmin -> {
                                            if (isAdmin) {
                                                return updateQuestionData(existingQuestion, questionDTO);
                                            } else {
                                                return Mono.error(new ForbiddenException("User is not authorized to update this question"));
                                            }
                                        });
                            });
                });
    }

    private Mono<Question> updateQuestionData(Question question, QuestionUpdateDTO questionDTO) {
        question.setTitle(questionDTO.getTitle());
        question.setMarkdownDescription(questionDTO.getMarkdownDescription());
        question.setPoints(questionDTO.getPoints());
        question.setUpdatedAt(LocalDateTime.now());
        return questionRepository.save(question);
    }

    public Mono<Void> deleteQuestion(Long questionId, Long userId) {
        return questionRepository.findById(questionId)
                .switchIfEmpty(Mono.error(new NotFoundException("Question not found")))
                .flatMap(question -> {
                    return contestRepository.findById(question.getContestId())
                            .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
                            .flatMap(contest -> {
                                if (contest.getCreatorId().equals(userId)) {
                                    return questionRepository.deleteById(questionId);
                                }

                                return contestAdminRepository
                                        .findByContestIdAndAdminId(contest.getId(), userId)
                                        .hasElement()
                                        .flatMap(isAdmin -> {
                                            if (isAdmin) {
                                                return questionRepository.deleteById(questionId);
                                            } else {
                                                return Mono.error(new ForbiddenException("User is not authorized to delete this question"));
                                            }
                                        });
                            });
                });
    }
}