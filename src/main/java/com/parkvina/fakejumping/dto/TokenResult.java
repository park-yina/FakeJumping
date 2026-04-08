package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenResult {
    private LoginResponse loginResponse;
    private String refreshToken;
}