package com.crucible.platform.v1.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestCaseResult {
    private Integer testCaseNumber;
    private Boolean passed;
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private String errorMessage;
    private Boolean isSample; // true if this is a sample test case
}
