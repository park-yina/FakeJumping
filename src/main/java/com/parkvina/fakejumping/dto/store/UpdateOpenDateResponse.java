package com.parkvina.fakejumping.dto.store;

import com.parkvina.fakejumping.enums.StoreStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor

public class UpdateOpenDateResponse {
    private Long storeId;
    private LocalDateTime openAt;
    private StoreStatus status;
}
