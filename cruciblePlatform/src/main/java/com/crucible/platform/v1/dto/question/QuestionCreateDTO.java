package com.crucible.platform.v1.dto.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionCreateDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String markdownDescription;

    @NotNull(message = "Points are required")
    @Positive(message = "Points must be a positive number")
    private Integer points;

    @NotNull(message = "Contest ID is required")
    private Long contestId;
}