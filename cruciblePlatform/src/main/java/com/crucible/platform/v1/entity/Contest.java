package com.crucible.platform.v1.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Table("contests")
@AllArgsConstructor
@NoArgsConstructor
public class Contest {

  @Id
  private Long id;

  private String name;
  private String bannerImageUrl;
  private String cardDescription;
  private String markdownDescription;
  private Long creatorId;
  private LocalDateTime startTime;
  private LocalDateTime endTime;

  @CreatedDate
  private LocalDateTime createdAt;

  @LastModifiedDate
  private LocalDateTime updatedAt;
}
