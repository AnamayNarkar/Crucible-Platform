package com.crucible.platform.v1.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestSubmitCodeRequest {
    private Long contestId;
    private Long questionId;
    private String code;
    private String language;
    private Boolean isRun; // true for run (sample test cases only), false for submit (all test cases)
}
