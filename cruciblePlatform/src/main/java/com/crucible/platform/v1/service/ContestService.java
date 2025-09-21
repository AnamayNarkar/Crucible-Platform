package com.crucible.platform.v1.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.dto.contest.CreateContest;
import com.crucible.platform.v1.entity.Contest;
import com.crucible.platform.v1.dto.ResponseEntity;

@Service
public class ContestService {
    
    public Mono<ResponseEntity<Contest>> createContest(WebSession session, CreateContest dto){
        System.out.println(session.getAttributes());
        return Mono.empty();
    }

}