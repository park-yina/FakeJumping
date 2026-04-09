package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PendingStoreInfo {
private Long id;
private String name;
private String region;
private LocalDateTime createdAt;

}
