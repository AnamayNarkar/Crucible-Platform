package com.crucible.platform.v1.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.ContestAdmin;

public interface ContestAdminRepository extends ReactiveCrudRepository<ContestAdmin, Long> {
    Flux<ContestAdmin> findByContestId(Long contestId);
    Flux<ContestAdmin> findByAdminId(Long adminId);
    
    @Query("SELECT * FROM contest_admins WHERE contest_id = :contestId AND admin_id = :adminId")
    Mono<ContestAdmin> findByContestIdAndAdminId(Long contestId, Long adminId);
    
    @Query("DELETE FROM contest_admins WHERE contest_id = :contestId AND admin_id = :adminId")
    Mono<Void> deleteByContestIdAndAdminId(Long contestId, Long adminId);
}
