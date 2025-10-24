package com.crucible.platform.v1.exceptions;

public class InternalServerErrorException extends RuntimeException {
    public InternalServerErrorException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public InternalServerErrorException(String message) {
        super(message);
    }
}