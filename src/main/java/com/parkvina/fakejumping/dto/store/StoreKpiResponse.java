package com.parkvina.fakejumping.dto.store;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoreKpiResponse {

    private Long total;
    private Long operating;

    private int scheduled;     // 오픈 예정
    private int notOpened;     // 오픈 미정

    private Long closed;
    private int closingScheduled; // 폐점 예정
    private int monthlyClosed;
}
