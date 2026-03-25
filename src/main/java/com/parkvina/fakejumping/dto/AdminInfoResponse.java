package com.parkvina.fakejumping.dto;

import com.parkvina.fakejumping.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminInfoResponse {
    private String username;
    private AdminRole role;
    private Boolean mustChangePassword;
}