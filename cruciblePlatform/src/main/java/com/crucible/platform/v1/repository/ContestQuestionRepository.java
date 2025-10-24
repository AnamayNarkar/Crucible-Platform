package com.crucible.platform.v1.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.ContestQuestion;

public interface ContestQuestionRepository extends ReactiveCrudRepository<ContestQuestion, Long> {
    Flux<ContestQuestion> findByContestId(Long contestId);
    Flux<ContestQuestion> findByQuestionId(Long questionId);
    
    @Query("SELECT * FROM contest_questions WHERE contest_id = :contestId AND question_id = :questionId")
    Mono<ContestQuestion> findByContestIdAndQuestionId(Long contestId, Long questionId);
    
    @Query("DELETE FROM contest_questions WHERE contest_id = :contestId AND question_id = :questionId")
    Mono<Void> deleteByContestIdAndQuestionId(Long contestId, Long questionId);
}
