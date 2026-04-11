package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PendingStoreInfo {
private Long id;
private String name;
private String region;
private LocalDateTime createdAt;

}
