package com.crucible.platform.v1.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.Contest;

import java.time.LocalDateTime;

public interface ContestRepository extends ReactiveCrudRepository<Contest, Long> {
    Mono<Contest> findById(Long id);
    Flux<Contest> findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(LocalDateTime start, LocalDateTime end);
    Flux<Contest> findByStartTimeGreaterThanEqual(LocalDateTime start);
}
