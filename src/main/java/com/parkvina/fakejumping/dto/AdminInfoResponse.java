package com.parkvina.fakejumping.dto;

import com.parkvina.fakejumping.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
@Data
@AllArgsConstructor
public class AdminInfoResponse {
    private String username;
    private AdminRole role;
    private Boolean mustChangePassword;
    private String storeName;
    private Long storeId;
}