package com.crucible.platform.v1.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Table("questions")
@AllArgsConstructor
@NoArgsConstructor
public class Question {
    @Id
    private Long id;

    private Long creatorId;
    private String title;
    private String markdownDescription;
    private Integer points;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

}