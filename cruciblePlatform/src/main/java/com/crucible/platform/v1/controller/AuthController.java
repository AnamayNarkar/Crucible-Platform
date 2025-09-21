package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.service.AuthService;
import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.auth.UsernameAndPasswordDTO;
import com.crucible.platform.v1.entity.User;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // @PostMapping("/login")
    // public Mono<ResponseEntity<String>> getLogin() {
    //     // This endpoint is hit when an unauthenticated user tries to access a protected resource.
    //     // You don't need to do anything here except signal that login is required.
    //     return Mono.just(new ResponseEntity<String>(401, null, "Login required", null));
    // }

    // @PostMapping("/login")
    // public Mono<ResponseEntity<User>> login(WebSession session, @RequestBody UsernameAndPasswordDTO body) {
    //     return authService.login(session, body);
    // }

    @PostMapping("/register")
    public Mono<ResponseEntity<User>> register(@RequestBody UsernameAndPasswordDTO body) {
        return authService.register(body);
    }

}
