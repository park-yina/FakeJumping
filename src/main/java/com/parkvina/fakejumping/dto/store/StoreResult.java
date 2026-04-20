package com.parkvina.fakejumping.dto.store;

import com.parkvina.fakejumping.enums.StoreStatus;
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
    private StoreStatus status;
    public String getStatusLabel() {
        return switch (status) {
            case OPERATING -> "운영중";
            case SCHEDULED -> "오픈 예정";
            case CLOSED -> "폐점";
            case NOT_OPENED -> "오픈 미정";
        };
    }
}
