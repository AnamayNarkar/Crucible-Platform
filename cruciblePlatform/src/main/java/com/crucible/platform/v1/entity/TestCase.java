package com.crucible.platform.v1.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table("test_cases")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestCase{
    @Id
    private Long id;
    private Long questionId;
    private String input;
    private String expectedOutput;
    private Boolean isSample;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}