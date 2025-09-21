package com.crucible.platform.v1.service;

import reactor.core.publisher.Mono;
import org.springframework.web.server.WebSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.entity.User;
import com.crucible.platform.v1.repository.UserRepository;
import com.crucible.platform.v1.dto.auth.UsernameAndPasswordDTO;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<ResponseEntity<User>> login(WebSession session, UsernameAndPasswordDTO body) {
        return userRepository.findByUsername(body.getUsername())
                .flatMap(user -> {
                    if (passwordEncoder.matches(body.getPassword(), user.getHashedPassword())) {
                        session.getAttributes().put("username", user.getUsername());
                        session.getAttributes().put("userId", user.getId());
                        user.setHashedPassword(null); // Omit password in response
                        return Mono.just(new ResponseEntity<>(1, user, "Login successful", "login successful"));
                    } else {
                        return Mono.just(new ResponseEntity<User>(401, null, "Invalid username or password", "password mismatch"));
                    }
                })
                .switchIfEmpty(Mono.defer(() -> 
                    Mono.just(new ResponseEntity<User>(404, null, "Invalid username or password", "user not found"))
                ));
    }

    public Mono<ResponseEntity<User>> register(UsernameAndPasswordDTO body) {
        return userRepository.findByUsername(body.getUsername())
                .flatMap(existingUser -> Mono.just(new ResponseEntity<User>(409, null, "User already exists", "user already exists")))
                .switchIfEmpty(Mono.defer(() -> {
                    String hashedPassword = passwordEncoder.encode(body.getPassword());

                    User newUser = new User();
                    newUser.setUsername(body.getUsername());
                    newUser.setHashedPassword(hashedPassword);
                    newUser.setRoles(new String[]{"USER"});

                    return userRepository.save(newUser)
                            .map(savedUser -> {
                                savedUser.setHashedPassword(null);
                                return new ResponseEntity<>(1, savedUser, "Registration successful", "registration successful");
                            });
                }));
    }
}