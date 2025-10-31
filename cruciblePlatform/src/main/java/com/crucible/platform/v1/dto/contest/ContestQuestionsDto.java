package com.crucible.platform.v1.dto.contest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestQuestionsDto {
    private Long id;
    private String title;
    private Integer points;
}
