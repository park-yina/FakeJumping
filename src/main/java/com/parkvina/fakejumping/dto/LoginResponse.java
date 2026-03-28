package com.parkvina.fakejumping.dto;

import com.parkvina.fakejumping.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class LoginResponse {
    private String accessToken;
    private Long adminId;
    private String username;
    private AdminRole role;
    private Boolean mustChangePassword;
    private StoreSummary storeSummary;
}
