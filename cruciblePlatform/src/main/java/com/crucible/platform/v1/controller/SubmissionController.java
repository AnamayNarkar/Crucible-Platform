package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.submission.ContestSubmitCodeRequest;
import com.crucible.platform.v1.dto.submission.SubmissionResponse;
import com.crucible.platform.v1.dto.submission.SubmitCodeRequest;
import com.crucible.platform.v1.service.SubmissionService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    /**
     * Submit code for a regular (public) problem
     * POST /api/v1/submissions/submit
     */
    @PostMapping("/submit")
    public Mono<ResponseEntity<SubmissionResponse>> submitCode(
            WebSession session, 
            @RequestBody SubmitCodeRequest request) {
        Long userId = (Long) session.getAttributes().get("userId");
        return submissionService.submitCode(userId, request);
    }

    /**
     * Submit code for a contest problem
     * POST /api/v1/submissions/contest
     */
    @PostMapping("/contest")
    public Mono<ResponseEntity<SubmissionResponse>> submitContestCode(
            WebSession session, 
            @RequestBody ContestSubmitCodeRequest request) {
        Long userId = (Long) session.getAttributes().get("userId");
        return submissionService.submitContestCode(userId, request);
    }
}
