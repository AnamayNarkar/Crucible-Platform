package com.crucible.platform.v1.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.TestCase;

public interface TestCaseRepository extends ReactiveCrudRepository<TestCase, Long> {
    Mono<TestCase> findById(Long id);
    Flux<TestCase> findByQuestionId(Long questionId);
    Flux<TestCase> findByQuestionIdAndIsSample(Long questionId, Boolean isSample);
}
