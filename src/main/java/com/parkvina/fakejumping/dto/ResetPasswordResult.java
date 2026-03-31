package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResetPasswordResult {
    Long id;
    String username;
    String tempPassword;
    String storeName;
}
