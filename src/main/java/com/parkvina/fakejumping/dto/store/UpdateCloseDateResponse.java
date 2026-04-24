package com.parkvina.fakejumping.dto.store;

import com.parkvina.fakejumping.enums.StoreStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UpdateCloseDateResponse {
    private Long storeId;
    private LocalDateTime closedAt;
    private StoreStatus status;
}
