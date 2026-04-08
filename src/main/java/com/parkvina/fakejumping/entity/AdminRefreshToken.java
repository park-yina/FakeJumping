package com.parkvina.fakejumping.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminRefreshToken {
    private Long id;
    private Long adminId;
    private String refreshToken;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
