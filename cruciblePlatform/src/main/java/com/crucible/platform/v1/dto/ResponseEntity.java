package com.crucible.platform.v1.dto;

import lombok.Data;

@Data
public class ResponseEntity<T> {
    private T data;
    private String message;

    public ResponseEntity(T data, String message) {
        this.data = data;
        this.message = message; 
    }    
}