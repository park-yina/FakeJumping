package com.parkvina.fakejumping.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class AuthCustomExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Map<String, String>> handleCustomException(CustomException e) {

        Map<String, String> body = new HashMap<>();
        body.put("message", e.getMessage());

        return ResponseEntity.status(e.getStatus()).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {

        Map<String, String> body = new HashMap<>();
        body.put("message", e.getMessage());

        return ResponseEntity.status(500).body(body);
    }
}