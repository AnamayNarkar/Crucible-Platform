package com.crucible.platform.v1.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.UserContest;

public interface UserContestRepository extends ReactiveCrudRepository<UserContest, Long> {
    Flux<UserContest> findByUserId(Long userId);
    Flux<UserContest> findByContestId(Long contestId);
    
    @Query("SELECT * FROM user_contests WHERE user_id = :userId AND contest_id = :contestId")
    Mono<UserContest> findByUserIdAndContestId(Long userId, Long contestId);
    
    @Query("SELECT * FROM user_contests WHERE contest_id = :contestId ORDER BY total_points DESC, last_submission_at ASC")
    Flux<UserContest> findByContestIdOrderByTotalPointsDescLastSubmissionAtAsc(Long contestId);
    
    @Query("DELETE FROM user_contests WHERE user_id = :userId AND contest_id = :contestId")
    Mono<Void> deleteByUserIdAndContestId(Long userId, Long contestId);
}
