package com.crucible.platform.v1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.index.Indexed;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("users")
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private Long id;

    @Indexed
    private String username;
    private String email;
    private String hashedPassword;
    private String[] roles;
}