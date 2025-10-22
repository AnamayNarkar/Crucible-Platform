package com.crucible.platform.v1.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfo {
  private Long id;
  private String username;
  private String email;
  private String[] roles;
}
