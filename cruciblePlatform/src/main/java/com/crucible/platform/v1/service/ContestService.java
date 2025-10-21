package com.crucible.platform.v1.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.dto.contest.CreateContest;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.repository.ContestRepository;

@Service
public class ContestService {
    private final ContestRepository contestRepository;

    public ContestService(ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }

    public Mono<ResponseEntity<Contest>> getContestById(Long contestId) {
        return contestRepository.findById(contestId)
                .map(contest -> new ResponseEntity<>(200, contest, "Contest retrieved successfully"))
                .defaultIfEmpty(new ResponseEntity<>(404, null, "Contest not found"));
    }

    public Mono<ResponseEntity<Contest>> createContest(WebSession session, CreateContest dto){
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId == null) {
            return Mono.just(new ResponseEntity<>(401, null, "User not authenticated"));
        }
        Contest contest = new Contest(null, dto.getName(), dto.getBannerImageUrl(), dto.getCardDescription(),dto.getMarkdownDescription(), userId, dto.getStartTime(), dto.getEndTime(), null, null);
        return contestRepository.save(contest)
                .map(savedContest -> new ResponseEntity<>(201, savedContest, "Contest created successfully"));
    }

    public Mono<ResponseEntity<List<Contest>>> getOngoingContests() {
        LocalDateTime now = LocalDateTime.now();
        return contestRepository.findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(now, now)
                .collectList()
                .map(contests -> new ResponseEntity<>(200, contests, "Ongoing contests retrieved successfully"));
    }

    public Mono<ResponseEntity<List<Contest>>> getUpcomingContests() {
        LocalDateTime now = LocalDateTime.now();
        return contestRepository.findByStartTimeGreaterThanEqual(now)
                .collectList()
                .map(contests -> new ResponseEntity<>(200, contests, "Upcoming contests retrieved successfully"));
    }

}