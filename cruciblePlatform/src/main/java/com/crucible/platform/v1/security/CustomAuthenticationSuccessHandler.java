package com.crucible.platform.v1.security;

import com.crucible.platform.v1.repository.UserRepository;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomAuthenticationSuccessHandler implements ServerAuthenticationSuccessHandler {

  private final UserRepository userRepository;

  public CustomAuthenticationSuccessHandler(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
    String username = authentication.getName();
    ServerHttpResponse response = webFilterExchange.getExchange().getResponse();

    // Set up the successful response headers
    response.setStatusCode(HttpStatus.OK);
    response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

    return userRepository.findByUsername(username)
        .flatMap(user ->
        // 1. Get the session and populate it with user details
        webFilterExchange.getExchange().getSession().doOnNext(session -> {
          session.getAttributes().put("userId", user.getId());
          session.getAttributes().put("email", user.getEmail());
          session.getAttributes().put("username", user.getUsername());
          session.getAttributes().put("roles", user.getRoles());
          System.out.println("✅ Authentication successful for user: " + user.getUsername());
        })
            .thenReturn(user) // Pass the user object down the reactive chain
        )
        .flatMap(user -> {
          // 2. Create the JSON response body
          String responseBody = "{\"message\": \"Login successful\", \"username\": \"" + user.getUsername() + "\"}";
          DataBuffer buffer = response.bufferFactory().wrap(responseBody.getBytes());

          // 3. Write the response to the client and terminate the filter chain
          return response.writeWith(Mono.just(buffer));
        });
  }
}
