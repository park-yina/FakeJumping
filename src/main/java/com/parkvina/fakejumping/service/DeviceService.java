package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.device.*;
import com.parkvina.fakejumping.dto.store.StoreResult;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Device;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.enums.DeviceStatus;
import com.parkvina.fakejumping.enums.DeviceType;
import com.parkvina.fakejumping.enums.StoreStatus;
import com.parkvina.fakejumping.mapper.DeviceMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class DeviceService {
    private final DiscordService discordService;
    private final DeviceMapper deviceMapper;
    private final AuthService authService;

    public static String generateByType(DeviceType type) {

        String prefix = getPrefix(type);

        String uuid = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12);

        return prefix + "-" + uuid;
    }

    public String generateSerial(DeviceType type, Long id) {

        String prefix = getPrefix(type);

        return prefix + "-" + String.format("%04d", id);
    }

    private static @NonNull String getPrefix(DeviceType type) {
        String prefix = switch (type) {
            case CAM -> "CAM";
            case SCORE -> "SCR";
            case CONTROLLER -> "CTR";
            case LED -> "LED";
        };
        return prefix;
    }

    @Transactional
    public DeviceCreateResponse createDevice(DeviceCreateRequest req) {

        Device device = new Device();
        device.setDeviceName(generateUniqueDeviceName(req.getDeviceName()));
        device.setDeviceType(req.getDeviceType());
        device.setDeviceUuid(generateByType(req.getDeviceType()));
        device.setStoreId(null);
        device.setStatus(DeviceStatus.REGISTERED);

        deviceMapper.insertDevice(device);

        String serial = generateSerial(device.getDeviceType(), device.getId());
        device.setSerialNumber(serial);
        deviceMapper.updateSerial(device.getId(), serial);

        return from(device);
    }

    @Transactional
    public List<DeviceCreateResponse> createDevices(
            List<DeviceCreateRequest> reqs
    ) {

        List<DeviceCreateResponse> result = new ArrayList<>();

        List<Device> createdDevices = new ArrayList<>();

        for (DeviceCreateRequest req : reqs) {

            Device device = new Device();

            device.setDeviceName(
                    generateUniqueDeviceName(
                            req.getDeviceName()
                    )
            );

            device.setDeviceType(req.getDeviceType());

            device.setDeviceUuid(
                    generateByType(req.getDeviceType())
            );

            device.setStoreId(null);

            device.setStatus(DeviceStatus.REGISTERED);

            deviceMapper.insertDevice(device);

            String serial =
                    generateSerial(
                            device.getDeviceType(),
                            device.getId()
                    );

            deviceMapper.updateSerial(
                    device.getId(),
                    serial
            );

            device.setSerialNumber(serial);

            createdDevices.add(device);

            result.add(from(device));
        }

        Admin me = authService.getLoginAdmin();

        discordService.sendDeviceRegisterLog(
                me.getUsername(),
                createdDevices
        );

        return result;
    }

    private String generateUniqueDeviceName(String baseName) {

        List<String> names =
                deviceMapper.findNamesByPrefix(baseName);

        // 동일 이름 자체가 없으면 그대로
        if (names.isEmpty()) {
            return baseName;
        }

        int max = 1;

        Pattern pattern = Pattern.compile(
                Pattern.quote(baseName) + " \\((\\d+)\\)"
        );

        for (String name : names) {

            // "테스트"
            if (name.equals(baseName)) {
                max = Math.max(max, 1);
                continue;
            }

            // "테스트 (2)"
            Matcher matcher = pattern.matcher(name);

            if (matcher.matches()) {

                int num = Integer.parseInt(matcher.group(1));

                max = Math.max(max, num);
            }
        }

        return baseName + " (" + (max + 1) + ")";
    }

    @Transactional
    public List<DeviceDeactivateResponse> deactivateDevices(
            DeviceDeleteRequest req
    ) {

        List<Long> ids = req.getIds();

        if (ids == null || ids.isEmpty()) {

            throw new CustomException(
                    "삭제할 장비가 없습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        List<Device> devices =
                deviceMapper.findDevicesByIds(ids);

        if (devices.isEmpty()) {

            throw new CustomException(
                    "장비를 찾을 수 없습니다.",
                    HttpStatus.NOT_FOUND
            );
        }
        if (devices.size() != ids.size()) {

            throw new CustomException(
                    "존재하지 않는 장비가 포함되어 있습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        boolean hasOnlineDevice = devices.stream()

                .anyMatch(device ->
                        device.getStatus() == DeviceStatus.ONLINE
                );

        if (hasOnlineDevice && !req.isForce()) {

            throw new CustomException(
                    "온라인 상태 장비가 포함되어 있습니다.",
                    HttpStatus.CONFLICT
            );
        }

        deviceMapper.deactivateDevices(ids);

        return devices.stream()

                .map(device ->
                        new DeviceDeactivateResponse(

                                device.getId(),

                                device.getStoreId(),

                                false
                        )
                )

                .toList();
    }

    public static DeviceCreateResponse from(Device device) {
        DeviceCreateResponse res = new DeviceCreateResponse();
        res.setId(device.getId());
        res.setDeviceName(device.getDeviceName());
        res.setDeviceType(device.getDeviceType());
        res.setDeviceUuid(device.getDeviceUuid());
        res.setStoreId(device.getStoreId());
        res.setSerialNumber(device.getSerialNumber());
        res.setStatus(device.getStatus());
        return res;
    }

    public Map<String, Object> getDeviceWithPaging(

            DeviceType deviceType,
            DeviceStatus status,
            Long storeId,

            int page,
            int size
    ) {

        Admin me = authService.getLoginAdmin();
        if (me.getRole() == AdminRole.STORE_ADMIN) {
            storeId = me.getStoreId();
            if (status == DeviceStatus.REGISTERED) {
                throw new CustomException(
                        "권한 없음",
                        HttpStatus.FORBIDDEN
                );
            }
        }

        Paging paging = Paging.of(page, size);

        List<DeviceResult> content =
                deviceMapper.findDevicesPaged(

                        deviceType,
                        status,
                        storeId,

                        paging.size(),
                        paging.offset(),

                        30
                );

        int total =
                deviceMapper.countDevices(

                        deviceType,
                        status,
                        storeId
                );

        Map<String, Object> result = new HashMap<>();

        result.put("content", content);

        result.put("total", total);

        result.put("page", paging.page());

        result.put("size", paging.size());

        result.put(
                "hasNext",
                (paging.page() + 1) * paging.size() < total
        );

        result.put(
                "hasPrev",
                paging.page() > 0
        );

        return result;
    }
}
