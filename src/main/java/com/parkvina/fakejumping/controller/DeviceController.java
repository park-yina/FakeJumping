package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.device.DeviceCreateRequest;
import com.parkvina.fakejumping.dto.device.DeviceCreateResponse;
import com.parkvina.fakejumping.enums.DeviceType;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.DeviceMapper;
import com.parkvina.fakejumping.security.AuthService;
import com.parkvina.fakejumping.service.DeviceService;
import com.parkvina.fakejumping.service.DiscordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/devices")
public class DeviceController {
    private final DeviceService deviceService;
    private final AdminMapper adminMapper;
    private final DiscordService discordService;
    private final AuthService authService;

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<DeviceCreateResponse> createDevice(
            @RequestBody DeviceCreateRequest req
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(deviceService.createDevice(req));
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/create/bulk")
    public ResponseEntity<List<DeviceCreateResponse>> createDevices(@RequestBody List<DeviceCreateRequest> reqs) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(deviceService.createDevices(reqs));
    }

    @GetMapping("/device-types")
    public List<String> getDeviceTypes() {
        return Arrays.stream(DeviceType.values())
                .map(Enum::name)
                .toList();
    }
}
