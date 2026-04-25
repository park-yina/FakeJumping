package com.parkvina.fakejumping.dto;

import com.parkvina.fakejumping.dto.login.LoginResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenResult {
    private LoginResponse loginResponse;
    private String refreshToken;
}