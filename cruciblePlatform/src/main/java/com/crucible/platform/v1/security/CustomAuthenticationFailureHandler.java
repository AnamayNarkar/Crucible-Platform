package com.crucible.platform.v1.security;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomAuthenticationFailureHandler implements ServerAuthenticationFailureHandler {

    @Override
    public Mono<Void> onAuthenticationFailure(WebFilterExchange webFilterExchange, AuthenticationException exception) {
        ServerHttpResponse response = webFilterExchange.getExchange().getResponse();
        
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        System.err.println("🛑 Authentication failed: " + exception.getMessage());

        // Create a generic error message for the client for security
        String responseBody = "{\"error\": \"Invalid Credentials\", \"message\": \"Authentication failed, please check your username and password.\"}";
        DataBuffer buffer = response.bufferFactory().wrap(responseBody.getBytes());
        
        // Write the response and terminate the chain
        return response.writeWith(Mono.just(buffer));
    }
}