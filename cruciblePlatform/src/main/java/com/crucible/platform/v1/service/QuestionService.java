package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.dto.question.QuestionCreateDTO;
import com.crucible.platform.v1.entity.Question;
import com.crucible.platform.v1.exceptions.ForbiddenException;
import com.crucible.platform.v1.exceptions.NotFoundException;
import com.crucible.platform.v1.repository.ContestAdminRepository;
import com.crucible.platform.v1.repository.ContestRepository;
import com.crucible.platform.v1.repository.QuestionRepository;

import java.time.LocalDateTime;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ContestRepository contestRepository;
    private final ContestAdminRepository contestAdminRepository;
    // FIX: Removed ContestQuestionRepository

    public QuestionService(QuestionRepository questionRepository,
                           ContestRepository contestRepository,
                           ContestAdminRepository contestAdminRepository) {
        // FIX: Removed ContestQuestionRepository from constructor
        this.questionRepository = questionRepository;
        this.contestRepository = contestRepository;
        this.contestAdminRepository = contestAdminRepository;
    }

    public Mono<Question> createQuestion(QuestionCreateDTO questionDTO, Long creatorId) {

        // FIX: This mono now creates the Question with the contestId,
        // as per your one-to-many database schema.
        Mono<Question> saveQuestion = Mono.fromSupplier(() -> {
            Question newQuestion = new Question(
                    null,
                    questionDTO.getTitle(),
                    questionDTO.getMarkdownDescription(),
                    questionDTO.getPoints(),
                    creatorId,
                    questionDTO.getContestId(), // <-- FIX: Set contestId directly
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );
            return newQuestion;
        }).flatMap(questionRepository::save); // FIX: Just save the question. No linking needed.

        // This authorization logic is still correct.
        // It now returns the new 'saveQuestion' mono on success.
        return contestRepository.findById(questionDTO.getContestId())
                .switchIfEmpty(Mono.error(new NotFoundException("Contest not found")))
                .flatMap(contest -> {
                    // 1. Check if the user is the contest creator
                    if (contest.getCreatorId().equals(creatorId)) {
                        return saveQuestion;
                    }

                    // 2. If not the creator, check if they are a contest admin
                    return contestAdminRepository
                            .findByContestIdAndAdminId(contest.getId(), creatorId)
                            .hasElement() // Emits true if an admin entry exists, false otherwise
                            .flatMap(isAdmin -> {
                                if (isAdmin) {
                                    return saveQuestion;
                                } else {
                                    return Mono.error(new ForbiddenException("User is not authorized to add questions to this contest"));
                                }
                            });
                });
    }
}