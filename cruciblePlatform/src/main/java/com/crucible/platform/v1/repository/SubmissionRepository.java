package com.crucible.platform.v1.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.Submission;

public interface SubmissionRepository extends ReactiveCrudRepository<Submission, Long> {
    Mono<Submission> findById(Long id);
    Flux<Submission> findByUserId(Long userId);
    Flux<Submission> findByQuestionId(Long questionId);
    Flux<Submission> findByUserIdAndQuestionId(Long userId, Long questionId);
    Flux<Submission> findByStatus(String status);
}
