package com.crucible.platform.v1.entity;

import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Table("contest_admins")
@AllArgsConstructor
@NoArgsConstructor
public class ContestAdmin {
    
    private Long contestId;
    private Long adminId;
}
