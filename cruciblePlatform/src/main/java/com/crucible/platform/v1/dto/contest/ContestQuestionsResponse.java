package com.crucible.platform.v1.dto.contest;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestQuestionsResponse {
    private Long contestId;
    private String contestName;
    private Boolean hasParticipated;
    private List<ContestQuestionsDto> questions;
}
