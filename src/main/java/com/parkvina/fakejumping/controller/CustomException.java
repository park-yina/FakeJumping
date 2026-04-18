package com.parkvina.fakejumping.controller;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    // code 없는 기본 생성자
    public CustomException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.code = null;
    }

    // code 있는 생성자
    public CustomException(String code, String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.code = code;
    }
}