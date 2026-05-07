package com.parkvina.fakejumping.dto.device;

import com.parkvina.fakejumping.enums.DeviceType;
import lombok.Data;

@Data
public class DeviceCreateRequest {
    private String serialNumber;
    private String deviceName;
    private DeviceType deviceType;
    private Long storeId;
}
