package com.crucible.platform.v1.dto;

import lombok.Data;

@Data
public class ResponseEntity<T> {
    private T data;
    private Integer statusCode;
    private String message;
    private String messageForUser;

    public ResponseEntity(Integer statusCode, T data,String message, String messageForUser) {
        this.data = data;
        this.message = message; 
        this.messageForUser = messageForUser;
        this.statusCode = statusCode;
    }    
}