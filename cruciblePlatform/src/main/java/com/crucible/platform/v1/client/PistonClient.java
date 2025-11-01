package com.crucible.platform.v1.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.dto.submission.PistonExecuteRequest;
import com.crucible.platform.v1.dto.submission.PistonExecuteResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class PistonClient {
    
    private final WebClient webClient;
    private static final String PISTON_API_URL = "https://emkc.org/api/v2/piston";

    private static final Logger logger = LoggerFactory.getLogger(PistonClient.class);

    public PistonClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl(PISTON_API_URL)
            .build();
    }

    public Mono<PistonExecuteResponse> executeCode(PistonExecuteRequest request) {
        logger.info("Executing code via Piston API for language: {}", request.getLanguage());
        return webClient.post()
            .uri("/execute")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(PistonExecuteResponse.class)
            .doOnNext(response -> logger.info("Piston API execution completed for language: {}, run code: {}, response: {}", 
                request.getLanguage(), response.getRun() != null ? response.getRun().getCode() : "null", response))
            .onErrorResume(e -> {
                // Log error and return a failed response
                logger.error("Error calling Piston API for language {}: {}", request.getLanguage(), e.getMessage(), e);
                return Mono.error(new RuntimeException("Failed to execute code via Piston API", e));
            });
    }
}
