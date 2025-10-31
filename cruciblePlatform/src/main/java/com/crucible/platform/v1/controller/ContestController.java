package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.server.WebSession;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.contest.ContestDetailsForUser;
import com.crucible.platform.v1.dto.contest.CreateContest;
import com.crucible.platform.v1.dto.contest.UpdateContest;
import com.crucible.platform.v1.dto.contest.ManageContestResponse;
import com.crucible.platform.v1.dto.contest.ContestQuestionsResponse;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.service.ContestService;

import reactor.core.publisher.Mono;
import java.util.List;

@RestController
@RequestMapping("/api/v1/contests")
public class ContestController {

  private final ContestService contestService;

  public ContestController(ContestService contestService) {
    this.contestService = contestService;
  }

  @GetMapping("/user")
  public Mono<ResponseEntity<List<Contest>>> getUserManagedContests(WebSession session) {
    Long userId = (Long) session.getAttributes().get("userId");
    return contestService.getUserManagedContests(userId);
  }

  @GetMapping("/live")
  public Mono<ResponseEntity<List<Contest>>> getLiveContest() {
    return contestService.getOngoingContests();
  }

  @GetMapping("/upcoming")
  public Mono<ResponseEntity<List<Contest>>> getUpcomingContests() {
    return contestService.getUpcomingContests();
  }

  @GetMapping("/past")
  public Mono<ResponseEntity<List<Contest>>> getPastContests() {
    return contestService.getPastContests();
  }

  @PostMapping("")
  public Mono<ResponseEntity<Contest>> createContest(WebSession session, @RequestBody CreateContest dto) {
    return contestService.createContest(session, dto);
  }

  @GetMapping("/manage/{contestId}")
  public Mono<ResponseEntity<ManageContestResponse>> getContestForManagement(WebSession session,@PathVariable Long contestId) {
    Long userId = (Long) session.getAttributes().get("userId");
    return contestService.getContestForManagement(contestId, userId);
  }

  @PutMapping("/{contestId}")
  public Mono<ResponseEntity<Contest>> updateContest(WebSession session, @PathVariable Long contestId, @RequestBody UpdateContest dto) {
    Long userId = (Long) session.getAttributes().get("userId");
    return contestService.updateContest(contestId, userId, dto);
  }

  @DeleteMapping("/{contestId}")
  public Mono<ResponseEntity<Void>> deleteContest(WebSession session, @PathVariable Long contestId) {
    Long userId = (Long) session.getAttributes().get("userId");
    return contestService.deleteContest(contestId, userId);
  }

  @GetMapping("/{contestId}")
  public Mono<ResponseEntity<ContestDetailsForUser>> getContestById(WebSession session, @PathVariable Long contestId) {
    Long userId = (Long) session.getAttributes().get("userId");
    return contestService.getContestById(userId, contestId);
  }

  @GetMapping("/{contestId}/questions")
  public Mono<ResponseEntity<ContestQuestionsResponse>> getContestQuestions(WebSession session, @PathVariable Long contestId) {
    Long userId = (Long) session.getAttributes().get("userId");
    return contestService.getContestQuestions(contestId, userId);
  }

  @PostMapping("/{contestId}/participate")
  public Mono<ResponseEntity<Void>> participateInContest(WebSession session, @PathVariable Long contestId) {
    Long userId = (Long) session.getAttributes().get("userId");
    return contestService.participateInContest(contestId, userId);
  }

}