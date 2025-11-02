package com.crucible.platform.v1.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import com.crucible.platform.v1.dto.contest.ContestLeaderboardResponse;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Keeps one hot, replay-last-1 sink per contest so new SSE subscribers get the current
 * leaderboard immediately and every subsequent update is pushed to all connected clients.
 */
@Service
public class LeaderboardSseService {

  private static final Logger logger = LoggerFactory.getLogger(LeaderboardSseService.class);

  private final Map<Long, Sinks.Many<ContestLeaderboardResponse>> sinks = new ConcurrentHashMap<>();

  public Flux<ContestLeaderboardResponse> subscribe(Long contestId) {
    return sinkFor(contestId).asFlux();
  }

  public void publish(Long contestId, ContestLeaderboardResponse response) {
    Sinks.Many<ContestLeaderboardResponse> sink = sinkFor(contestId);
    // Serialize emissions per-contest: Sinks.Many requires non-concurrent tryEmitNext calls,
    // and multiple submissions for the same contest can be graded at the same time.
    synchronized (sink) {
      Sinks.EmitResult result = sink.tryEmitNext(response);
      if (result.isFailure()) {
        logger.warn("Failed to publish leaderboard update for contest {}: {}", contestId, result);
      }
    }
  }

  private Sinks.Many<ContestLeaderboardResponse> sinkFor(Long contestId) {
    return sinks.computeIfAbsent(contestId, id -> Sinks.many().replay().limit(1));
  }
}
