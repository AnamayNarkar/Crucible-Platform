package com.crucible.platform.v1.controller;

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
    
    public Mono<ResponseEntity<TestCase>> createTestCase(WebSession session, @RequestBody AlterTestCaseDTO testCaseDTO) {
        Long creatorId = (Long) session.getAttributes().get("userId");
        return testCaseService.createTestCase(testCaseDTO, creatorId)
                .map(testCase -> new ResponseEntity<>(testCase, "Test case created successfully"));
    }

}