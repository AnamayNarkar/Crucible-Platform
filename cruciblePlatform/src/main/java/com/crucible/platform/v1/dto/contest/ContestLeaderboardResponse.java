package com.crucible.platform.v1.dto.contest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestLeaderboardResponse {
    private Long contestId;
    private String contestName;
    private List<LeaderboardEntryDto> leaderboard;
}
