package com.parkvina.fakejumping.entity;

import com.parkvina.fakejumping.enums.DeviceStatus;
import com.parkvina.fakejumping.enums.DeviceType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Device {
    Long id;
    Long storeId;
    String serialNumber;
    String deviceUuid;
    String deviceName;
    DeviceType deviceType;
    Boolean isActive;
    LocalDateTime createdAt;
    DeviceStatus status;

}
