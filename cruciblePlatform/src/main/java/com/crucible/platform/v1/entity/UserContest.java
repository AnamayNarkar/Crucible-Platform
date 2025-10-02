package com.crucible.platform.v1.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Table("user_contests")
@AllArgsConstructor
@NoArgsConstructor
public class UserContest {
    
    private Long userId;
    private Long contestId;
    
    @CreatedDate
    private LocalDateTime joinedAt;
    
    private Integer solvedQuestions;
    private Integer totalSubmissions;
    private Integer totalPoints;
    private LocalDateTime lastSubmissionAt;
    private Integer rank;
    
    // Constructor for creating new entries with default values
    public UserContest(Long userId, Long contestId) {
        this.userId = userId;
        this.contestId = contestId;
        this.solvedQuestions = 0;
        this.totalSubmissions = 0;
        this.totalPoints = 0;
    }
}
