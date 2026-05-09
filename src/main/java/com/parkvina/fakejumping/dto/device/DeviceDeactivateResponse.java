package com.parkvina.fakejumping.dto.device;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DeviceDeactivateResponse {

    private Long deviceId;
    private Long storeId;

    private boolean isActive;
}
