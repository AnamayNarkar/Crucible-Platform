package com.crucible.platform.v1.service;

import reactor.core.publisher.Mono;
import org.springframework.web.server.WebSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.entity.User;
import com.crucible.platform.v1.repository.UserRepository;
import com.crucible.platform.v1.dto.auth.UserRegistrationDTO;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<ResponseEntity<User>> register(UserRegistrationDTO body) {
        return userRepository.findByUsername(body.getUsername())
                .flatMap(existingUser -> Mono.just(new ResponseEntity<User>(409, null, "User already exists")))
                .switchIfEmpty(Mono.defer(() -> {
                    String hashedPassword = passwordEncoder.encode(body.getPassword());

                    User newUser = new User();
                    newUser.setUsername(body.getUsername());
                    newUser.setEmail(body.getEmail());
                    newUser.setHashedPassword(hashedPassword);
                    newUser.setRoles(new String[]{"USER"});

                    return userRepository.save(newUser)
                            .map(savedUser -> {
                                savedUser.setHashedPassword(null);
                                return new ResponseEntity<>(1, savedUser, "Registration successful");
                            });
                }));
    }
}