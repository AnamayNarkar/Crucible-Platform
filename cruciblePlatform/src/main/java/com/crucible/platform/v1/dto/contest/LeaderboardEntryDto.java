package com.crucible.platform.v1.dto.contest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardEntryDto {
    private Long userId;
    private String username;
    private Integer totalScore;
    private Integer solvedProblems;
    private Integer rank;
}
