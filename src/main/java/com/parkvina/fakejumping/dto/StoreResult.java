package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoreResult {
    private Long id;
    private String name;
    private String region;
    private String city;
    private String district;

    private String address;
    private String status;
}
