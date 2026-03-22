package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateResult {
    private Long storeId;
    private String storeName;
    private String username;
    private String tempPassword;

}
