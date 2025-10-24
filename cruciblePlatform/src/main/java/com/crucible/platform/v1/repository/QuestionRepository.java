package com.crucible.platform.v1.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.Question;

public interface QuestionRepository extends ReactiveCrudRepository<Question, Long> {
    Mono<Question> findById(Long id);
    Flux<Question> findByCreatorId(Long creatorId);
    Flux<Question> findByTitleContainingIgnoreCase(String title);
}
