package com.parkvina.fakejumping.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Store {
    private Long id;
    private String name;
    private String region;
    private String address;
    private String city;
    private String district;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private LocalDateTime openAt;

}
