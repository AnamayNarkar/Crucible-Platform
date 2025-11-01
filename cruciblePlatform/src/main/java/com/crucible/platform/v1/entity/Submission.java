package com.crucible.platform.v1.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table("submissions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Submission {
    
    @Id
    private Long id;

    private Long userId;
    private Long questionId;
    private Long contestId; // Optional field because not all submissions are part of a contest - can be null
    
    private String code;
    private String language;
    private String status; // e.g., "Pending", "Accepted", "Wrong Answer", TLE, etc.

    private String output; // Optional field because its not present at creation - can be null

    @CreatedDate
    private LocalDateTime createdAt;

}
