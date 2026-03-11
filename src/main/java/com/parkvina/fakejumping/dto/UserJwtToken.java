package com.parkvina.fakejumping.dto;

import com.parkvina.fakejumping.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@AllArgsConstructor
public class UserJwtToken {
    private String grantType;
    private String accessToken;
    private String username;
    private AdminRole role;

}
