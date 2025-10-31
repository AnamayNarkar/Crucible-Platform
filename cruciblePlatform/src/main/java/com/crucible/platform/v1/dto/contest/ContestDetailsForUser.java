package com.crucible.platform.v1.dto.contest;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestDetailsForUser {
  private Long id;

  private String name;
  private String bannerImageUrl;
  private String cardDescription;
  private String markdownDescription;
  private Long creatorId;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  private Boolean hasUserParticipated;
}