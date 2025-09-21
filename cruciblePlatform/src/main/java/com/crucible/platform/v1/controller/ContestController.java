package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.contest.CreateContest;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.service.ContestService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/contests")
public class ContestController {

    private final ContestService contestService;

    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }
    
    @PostMapping("/create")
    public Mono<ResponseEntity<Contest>> createContest(WebSession session, CreateContest dto){
        return contestService.createContest(session, dto);
    }

}