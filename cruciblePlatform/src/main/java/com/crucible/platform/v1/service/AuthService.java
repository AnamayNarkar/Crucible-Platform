package com.crucible.platform.v1.service;

import reactor.core.publisher.Mono;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.entity.User;
import com.crucible.platform.v1.repository.UserRepository;
import com.crucible.platform.v1.dto.auth.UserRegistrationDTO;
import com.crucible.platform.v1.dto.auth.UserRegistrationResponse;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Mono<ResponseEntity<UserRegistrationResponse>> register(UserRegistrationDTO body) {
        return userRepository.findByUsername(body.getUsername())
                .flatMap(existingUser -> Mono.just(new ResponseEntity<UserRegistrationResponse>(null, "User already exists")))
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
                                UserRegistrationResponse response = new UserRegistrationResponse(
                                        savedUser.getId().toString(),
                                        savedUser.getUsername(),
                                        savedUser.getEmail(),
                                        savedUser.getRoles()
                                );
                                return new ResponseEntity<>(response, "Registration successful");
                            });
                }));
    }
}