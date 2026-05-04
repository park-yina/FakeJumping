package com.parkvina.fakejumping.dto.device;

import com.parkvina.fakejumping.enums.DeviceStatus;
import com.parkvina.fakejumping.enums.DeviceType;
import lombok.Data;

@Data
public class DeviceCreateResponse {
    private Long id;

    private String serialNumber;
    private String deviceUuid;

    private String deviceName;
    private DeviceType deviceType;

    private DeviceStatus status;

    private Long storeId;
}
