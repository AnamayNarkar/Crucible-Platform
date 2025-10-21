package com.crucible.platform.v1.security;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomLogoutSuccessHandler implements ServerLogoutSuccessHandler {

    @Override
    public Mono<Void> onLogoutSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        ServerHttpResponse response = webFilterExchange.getExchange().getResponse();

        // Set up the successful response headers
        response.setStatusCode(HttpStatus.OK);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Create the JSON response body
        String responseBody = "{\"message\": \"Logout successful\"}";
        DataBuffer buffer = response.bufferFactory().wrap(responseBody.getBytes());

        // Write the response to the client and terminate the filter chain
        return response.writeWith(Mono.just(buffer));
    }
}
