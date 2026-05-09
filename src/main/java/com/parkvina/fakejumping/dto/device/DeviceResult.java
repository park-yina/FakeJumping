package com.parkvina.fakejumping.dto.device;

import com.parkvina.fakejumping.enums.DeviceStatus;
import com.parkvina.fakejumping.enums.DeviceType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DeviceResult {

    private Long id;

    private String deviceName;

    private String serialNumber;

    private String deviceUuid;

    private DeviceType deviceType;

    private DeviceStatus status;

    private Long storeId;

    private String storeName;

    private LocalDateTime lastPing;

    public String getStatusLabel() {

        return switch (status) {

            case REGISTERED -> "미배정";

            case ASSIGNED -> "배정 완료";

            case ONLINE -> "온라인";

            case OFFLINE -> "오프라인";

            case ERROR -> "장애";
        };
    }

    public String getDeviceTypeLabel() {

        return switch (deviceType) {

            case CAM -> "카메라";

            case SCORE -> "스코어보드";

            case CONTROLLER -> "게임 컨트롤러";

            case LED -> "LED 컨트롤러";
        };
    }
}