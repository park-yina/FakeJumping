package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.device.DeviceCreateRequest;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Device;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.enums.DeviceStatus;
import com.parkvina.fakejumping.enums.DeviceType;
import com.parkvina.fakejumping.mapper.DeviceMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {
    private final DiscordService discordService;
    private final DeviceMapper deviceMapper;
    private final AuthService authService;
    public static String generateByType(DeviceType type) {

        String prefix = switch (type) {
            case CAM -> "CAM";
            case SCORE -> "SCR";
            case CONTROLLER -> "CTR";
            case LED-> "LED";
        };

        String uuid = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12);

        return prefix + "-" + uuid;
    }
    public String generateSerial(DeviceType type, Long id) {

        String prefix = switch (type) {
            case CAM -> "CAM";
            case SCORE -> "SCR";
            case CONTROLLER -> "CTR";
            case LED ->"LED";
        };

        return prefix + "-" + String.format("%04d", id);
    }
    public void createDevice(DeviceCreateRequest req) {

        Admin me = authService.getLoginAdmin();

        if (me.getRole() != AdminRole.SUPER_ADMIN) {
            throw new CustomException("권한 없음", HttpStatus.FORBIDDEN);
        }

        Device device = new Device();

        device.setDeviceName(req.getDeviceName());
        device.setDeviceType(req.getDeviceType());
        device.setDeviceUuid(generateByType(req.getDeviceType()));

        device.setStoreId(null);
        device.setStatus(DeviceStatus.REGISTERED);

        deviceMapper.insertDevice(device);

        String serial = generateSerial(device.getDeviceType(), device.getId());
        deviceMapper.updateSerial(device.getId(), serial);
    }
}
