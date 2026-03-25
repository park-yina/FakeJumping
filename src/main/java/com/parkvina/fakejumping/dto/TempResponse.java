package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TempResponse {

    private Long id;
    private String username;
    private String storeName;
    private LocalDateTime createdAt;
}
