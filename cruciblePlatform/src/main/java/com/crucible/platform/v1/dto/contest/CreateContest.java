package com.crucible.platform.v1.dto.contest;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateContest {
    private String name;
    private String markdownDescription;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
