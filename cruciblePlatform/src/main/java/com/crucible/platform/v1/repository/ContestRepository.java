package com.crucible.platform.v1.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.Contest;

public interface ContestRepository extends ReactiveCrudRepository<Contest, Long> {
    public Mono<Contest> findById(Long id);
    
}
