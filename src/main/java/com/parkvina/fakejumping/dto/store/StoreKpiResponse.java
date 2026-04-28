package com.parkvina.fakejumping.dto.store;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoreKpiResponse {
    private Long closed;
    private int scheduled;
    private int monthlyClosed;

}
