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
import com.crucible.platform.v1.security.CustomLogoutSuccessHandler;
import com.crucible.platform.v1.repository.UserRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public ReactiveUserDetailsService userDetailsService(UserRepository userRepository) {
    return username -> userRepository.findByUsername(username).switchIfEmpty(userRepository.findByEmail(username))
        .map(myUser -> User.builder()
            .username(myUser.getUsername())
            .password(myUser.getHashedPassword())
            .roles(myUser.getRoles())
            .build());
  }

  @Bean
  public ReactiveUserDetailsPasswordService userDetailsPasswordService(UserRepository userRepository,
      PasswordEncoder passwordEncoder) {
    return (user, newPassword) -> userRepository.findByUsername(user.getUsername())
        .switchIfEmpty(userRepository.findByEmail(user.getUsername()))
        .doOnNext(myUser -> myUser.setHashedPassword(passwordEncoder.encode(newPassword)))
        .flatMap(userRepository::save)
        .thenReturn(user);
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
      ServerAuthenticationSuccessHandler successHandler, CustomAuthenticationFailureHandler failureHandler,
      ServerAuthenticationEntryPoint entryPoint, CustomLogoutSuccessHandler logoutSuccessHandler) {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeExchange(exchanges -> exchanges
            .pathMatchers(
                "/api/v1/health",
                "/api/v1/auth/login", // Handled by formLogin
                "/api/v1/auth/logout", // Handled by logout
                "/api/v1/auth/register" // Your custom controller
            ).permitAll()
            .anyExchange().authenticated())
        .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(entryPoint))
        .formLogin(formLogin -> formLogin
            .loginPage("/api/v1/auth/login") // URL for your GET controller to show login prompt
            .authenticationSuccessHandler(successHandler)
            .authenticationFailureHandler(failureHandler))
        .logout(logout -> logout.logoutUrl("/api/v1/auth/logout")
            .logoutSuccessHandler(logoutSuccessHandler));

    return http.build();
  }

}
