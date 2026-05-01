package com.parkvina.fakejumping.dto.login;

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
