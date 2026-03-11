package com.parkvina.fakejumping.entity;

import com.parkvina.fakejumping.enums.AdminRole;
import lombok.Data;

@Data
public class Admin {

    private Long id;

    private String username;

    private String password;

    private AdminRole role;

    private Long storeId;

    private Boolean isActive;

    private Boolean mustChangePassword;

}