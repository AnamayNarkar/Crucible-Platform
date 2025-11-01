package com.crucible.platform.v1.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionResponse {
    private Long submissionId;
    private String status; // "Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded", "Compilation Error"
    private String output;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private Boolean isRun; // true if this was a run operation (sample test cases only)
    private java.util.List<TestCaseResult> testCaseResults; // Individual test case results
}

