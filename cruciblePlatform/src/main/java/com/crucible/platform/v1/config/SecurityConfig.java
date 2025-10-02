package com.crucible.platform.v1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsPasswordService;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.crucible.platform.v1.security.CustomAuthenticationFailureHandler;
import com.crucible.platform.v1.repository.UserRepository;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfig{

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ReactiveUserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByUsername(username)
                .map(myUser -> User.builder()
                        .username(myUser.getUsername())
                        .password(myUser.getHashedPassword())
                        .roles(myUser.getRoles())
                        .build()
                );
    }

    @Bean
    public ReactiveUserDetailsPasswordService userDetailsPasswordService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return (user, newPassword) -> userRepository.findByUsername(user.getUsername())
                .doOnNext(myUser -> myUser.setHashedPassword(passwordEncoder.encode(newPassword)))
                .flatMap(userRepository::save)
                .thenReturn(user);
    }
    
    
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http, ServerAuthenticationSuccessHandler successHandler, CustomAuthenticationFailureHandler failureHandler, ServerAuthenticationEntryPoint entryPoint) {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/api/v1/auth/**").permitAll()
                .pathMatchers("/api/v1/contests/**").authenticated()
                .anyExchange().authenticated()
            ).
            exceptionHandling(exceptions -> 
                exceptions.authenticationEntryPoint(entryPoint)
            )
            .formLogin(formLogin ->
                formLogin
                    .loginPage("/api/v1/auth/login") // URL for your GET controller to show login prompt
                    .authenticationSuccessHandler(successHandler)
                    .authenticationFailureHandler(failureHandler) 
            )
            .logout(logout -> logout.logoutUrl("/api/v1/auth/logout"));

        return http.build();
    }

}