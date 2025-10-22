package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.service.AuthService;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.auth.UserInfo;
import com.crucible.platform.v1.dto.auth.UserRegistrationDTO;
import com.crucible.platform.v1.dto.auth.UserRegistrationResponse;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public Mono<ResponseEntity<UserRegistrationResponse>> register(@RequestBody UserRegistrationDTO body) {
    return authService.register(body);
  }

  @GetMapping("/verify-session")
  public Mono<ResponseEntity<String>> verifySession() {
    return Mono.just(new ResponseEntity<>(200, "Hello bitch, your session is valid", "yay"));
  }

  @GetMapping("/me")
  public Mono<ResponseEntity<UserInfo>> getMe(WebSession session) {
    Long id = (Long) session.getAttributes().get("userId");
    String username = (String) session.getAttributes().get("username");
    String email = (String) session.getAttributes().get("email");
    String[] roles = (String[]) session.getAttributes().get("roles");

    if (id == null) {
      return Mono.just(new ResponseEntity<>(401, null, "Not authenticated"));
    }

    UserInfo userInfo = new UserInfo(id, username, email, roles);
    return Mono.just(new ResponseEntity<>(200, userInfo, "User info retrieved"));
  }
}
