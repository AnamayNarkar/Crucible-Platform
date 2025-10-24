package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;

import reactor.core.publisher.Mono;

import com.crucible.platform.v1.entity.Question;
import com.crucible.platform.v1.service.QuestionService;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.question.QuestionCreateDTO;
import com.crucible.platform.v1.dto.question.QuestionUpdateDTO;

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

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Question>> getQuestion(@PathVariable Long id, WebSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        return questionService.getQuestion(id, userId)
                .map(question -> new ResponseEntity<>(question, "Question fetched successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Question>> updateQuestion(
            @PathVariable Long id,
            @RequestBody QuestionUpdateDTO questionDTO,
            WebSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        return questionService.updateQuestion(id, questionDTO, userId)
                .map(updatedQuestion -> new ResponseEntity<>(updatedQuestion, "Question updated successfully"));
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteQuestion(@PathVariable Long id, WebSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        return questionService.deleteQuestion(id, userId)
                .then(Mono.just(new ResponseEntity<Void>(null, "Question deleted successfully")));
    }

}
