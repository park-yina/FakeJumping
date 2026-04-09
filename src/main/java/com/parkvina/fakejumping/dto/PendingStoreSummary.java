package com.parkvina.fakejumping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PendingStoreSummary {
    private int count;
    private List<PendingStoreInfo> pendingStores;

}
