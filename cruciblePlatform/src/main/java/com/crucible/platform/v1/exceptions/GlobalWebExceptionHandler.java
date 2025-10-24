package com.crucible.platform.v1.exceptions;

import com.crucible.platform.v1.dto.ResponseEntity;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import reactor.core.publisher.Mono;

@RestControllerAdvice
@Slf4j
public class GlobalWebExceptionHandler {

    /**
     * Handles NotFoundException (HTTP 404).
     */
    @ExceptionHandler(NotFoundException.class)
    public Mono<org.springframework.http.ResponseEntity<ResponseEntity<Void>>> handleNotFound(NotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return createErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    /**
     * Handles UnauthorizedAccessException (HTTP 401).
     */
    @ExceptionHandler(UnauthorizedAccessException.class)
    public Mono<org.springframework.http.ResponseEntity<ResponseEntity<Void>>> handleUnauthorized(UnauthorizedAccessException ex) {
        log.warn("Unauthorized access: {}", ex.getMessage());
        return createErrorResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }
    
    /**
     * Handles specific InternalServerErrorException (HTTP 500).
     */
    @ExceptionHandler(InternalServerErrorException.class)
    public Mono<org.springframework.http.ResponseEntity<ResponseEntity<Void>>> handleInternalError(InternalServerErrorException ex) {
        log.error("Internal Server Error: {}", ex.getMessage(), ex);
        return createErrorResponse(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * A catch-all handler for any other unhandled exception (HTTP 500).
     * This is a safety net.
     */
    @ExceptionHandler(Exception.class)
    public Mono<org.springframework.http.ResponseEntity<ResponseEntity<Void>>> handleGenericException(Exception ex) {
        log.error("Unhandled exception occurred: {}", ex.getMessage(), ex);
        
        // Avoid leaking sensitive internal error details to the client
        String publicMessage = "An unexpected internal error occurred. Please try again later.";
        
        return createErrorResponse(publicMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Helper method to build the final response.
     * It creates your custom DTO and wraps it in Spring's ResponseEntity
     * to set the HTTP status code.
     *
     * @param message The error message for your DTO.
     * @param status  The HTTP status to set on the response.
     * @return A Mono<org.springframework.http.ResponseEntity<...>>
     */
    private Mono<org.springframework.http.ResponseEntity<ResponseEntity<Void>>> createErrorResponse(String message, HttpStatus status) {
        
        // 1. Create your custom DTO. We use <Void> since there is no 'data' in an error.
        ResponseEntity<Void> errorBody = new ResponseEntity<>(null, message);

        // 2. Create Spring's ResponseEntity, passing your DTO as the body
        //    and setting the HTTP status code.
        org.springframework.http.ResponseEntity<ResponseEntity<Void>> responseEntity = 
                new org.springframework.http.ResponseEntity<>(errorBody, status);

        // 3. Return as a Mono
        return Mono.just(responseEntity);
    }
}