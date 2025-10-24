package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;

import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.Question;
import com.crucible.platform.v1.service.QuestionService;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.question.QuestionCreateDTO;

@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

    private final QuestionService questionService;
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("")
    public Mono<ResponseEntity<Question>> createQuestion(@RequestBody QuestionCreateDTO question, WebSession session) {
        Long creatorId = (Long) session.getAttributes().get("userId");
        return questionService.createQuestion(question, creatorId)
                .map(createdQuestion -> new ResponseEntity<>(createdQuestion, "Question created successfully"));
    }

}
