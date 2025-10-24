package com.crucible.platform.v1.dto.testCase;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlterTestCaseDTO {
    private Long questionId;
    private String input;
    private String expectedOutput;
    private Boolean isSample;
}
