package com.crucible.platform.v1.dto.question;

import java.time.LocalDateTime;
import java.util.List;

import com.crucible.platform.v1.entity.Question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionWithSamplesDto {
    private Long id;
    private String title;
    private String markdownDescription;
    private Integer points;
    private Long creatorId;
    private Long contestId;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TestCaseDto> sampleTestCases;

    public QuestionWithSamplesDto(Question question, List<TestCaseDto> sampleTestCases) {
        this.id = question.getId();
        this.title = question.getTitle();
        this.markdownDescription = question.getMarkdownDescription();
        this.points = question.getPoints();
        this.creatorId = question.getCreatorId();
        this.contestId = question.getContestId();
        this.isPublic = question.getIsPublic();
        this.createdAt = question.getCreatedAt();
        this.updatedAt = question.getUpdatedAt();
        this.sampleTestCases = sampleTestCases;
    }
}
