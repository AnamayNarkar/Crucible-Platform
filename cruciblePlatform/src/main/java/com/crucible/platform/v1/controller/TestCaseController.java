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

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.testCase.AlterTestCaseDTO;
import com.crucible.platform.v1.entity.TestCase;
import com.crucible.platform.v1.service.TestCaseService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/test-cases")
public class TestCaseController {
    
    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }
    
    @PostMapping("")
    public Mono<ResponseEntity<TestCase>> createTestCase(WebSession session, @RequestBody AlterTestCaseDTO testCaseDTO) {
        Long creatorId = (Long) session.getAttributes().get("userId");
        return testCaseService.createTestCase(testCaseDTO, creatorId)
                .map(testCase -> new ResponseEntity<>(testCase, "Test case created successfully"));
    }

    @GetMapping("/question/{questionId}")
    public Mono<ResponseEntity<java.util.List<TestCase>>> getTestCasesByQuestion(
            @PathVariable Long questionId,
            WebSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        return testCaseService.getTestCasesByQuestion(questionId, userId)
                .flatMap(testCasesFlux -> testCasesFlux.collectList())
                .map(testCasesList -> new ResponseEntity<>(testCasesList, "Test cases fetched successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<TestCase>> updateTestCase(
            @PathVariable Long id,
            @RequestBody AlterTestCaseDTO testCaseDTO,
            WebSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        return testCaseService.updateTestCase(id, testCaseDTO, userId)
                .map(testCase -> new ResponseEntity<>(testCase, "Test case updated successfully"));
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteTestCase(@PathVariable Long id, WebSession session) {
        Long userId = (Long) session.getAttributes().get("userId");
        return testCaseService.deleteTestCase(id, userId)
                .then(Mono.just(new ResponseEntity<Void>(null, "Test case deleted successfully")));
    }

}