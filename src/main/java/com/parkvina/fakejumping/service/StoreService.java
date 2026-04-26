package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.*;
import com.parkvina.fakejumping.dto.login.ResetPasswordRequest;
import com.parkvina.fakejumping.dto.login.ResetPasswordResult;
import com.parkvina.fakejumping.dto.store.*;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.enums.AdminStatus;
import com.parkvina.fakejumping.enums.StoreStatus;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreMapper storeMapper;
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final DiscordService discordService;
    private final AuthService authService;

    public StoreStatus resolveStatus(Store store) {
        LocalDateTime now = LocalDateTime.now();
        if (store.getClosedAt() != null) {
            if (!store.getClosedAt().isAfter(now)) {
                return StoreStatus.CLOSED;
            }
        }

        if (store.getIsActive()
                && store.getOpenAt() != null
                && store.getOpenAt().isAfter(now)) {
            return StoreStatus.SCHEDULED;
        }

        // 운영중 (폐점 예정 포함)
        if (store.getIsActive()
                && store.getOpenAt() != null
                && !store.getOpenAt().isAfter(now)) {
            return StoreStatus.OPERATING;
        }

        if (store.getIsActive()
                && store.getOpenAt() == null) {
            return StoreStatus.NOT_OPENED;
        }

        return StoreStatus.NOT_OPENED;
    }

    public String generateTempPassword(int len) {
        SecureRandom secureRandom = new SecureRandom();
        String tempPasswordStr = IntStream.concat(
                        IntStream.concat(
                                IntStream.rangeClosed(65, 90),
                                IntStream.rangeClosed(97, 122)),
                        "!@#$%^&_=+".chars())
                .mapToObj(i -> String.valueOf((char) i))
                .collect(Collectors.joining());
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < len; i++) {
            builder.append(tempPasswordStr.charAt(secureRandom.nextInt(tempPasswordStr.length())));
        }
        return builder.toString();

    }

    public String generateUsername(String storeName) {
        return storeName + "_" + UUID.randomUUID().toString().substring(0, 4);

    }

    @Transactional
    public UpdateCloseDateResponse updateCloseDate(
            Long storeId,
            LocalDateTime closedAt
    ) {
        Store store = storeMapper.findById(storeId);

        if (store == null) {
            throw new CustomException("STORE_NOT_FOUND", "매장을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        if (closedAt == null) {
            throw new CustomException(
                    "CLOSED_DATE_REQUIRED",
                    "폐점일은 필수입니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 이미 폐점된 매장만 수정 가능
        if (store.getClosedAt() == null) {
            throw new CustomException(
                    "NOT_CLOSED_STORE",
                    "폐점된 매장이 아닙니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 오픈일 이전 폐점 방지
        if (store.getOpenAt() != null && closedAt.isBefore(store.getOpenAt())) {
            throw new CustomException(
                    "INVALID_CLOSE_DATE",
                    "폐점일은 오픈일보다 이전일 수 없습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        storeMapper.updateClosedAt(storeId, closedAt);
        store.setClosedAt(closedAt);

        return new UpdateCloseDateResponse(
                storeId,
                closedAt,
                resolveStatus(store)
        );
    }
    @Transactional
    public UpdateCloseDateResponse reopenStore(Long storeId) {

        Store store = storeMapper.findById(storeId);

        if (store == null) {
            throw new CustomException(
                    "STORE_NOT_FOUND",
                    "매장을 찾을 수 없습니다.",
                    HttpStatus.NOT_FOUND
            );

        }

        if (store.getClosedAt() == null) {
            throw new CustomException(
                    "NOT_CLOSED_STORE",
                    "폐점된 매장이 아닙니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        storeMapper.updateClosedAt(storeId, null);

        adminMapper.activateStoreAdmins(storeId);

        store.setClosedAt(null);

        return new UpdateCloseDateResponse(
                storeId,
                null,
                resolveStatus(store)
        );
    }
    @Transactional
    public UpdateCloseDateResponse closeStore(
            Long storeId,
            LocalDateTime closedAt,
            boolean force
    ) {
        Store store = storeMapper.findById(storeId);

        if (store == null) {
            throw new CustomException("매장을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        if (closedAt == null) {
            throw new CustomException("폐점일은 필수입니다.", HttpStatus.BAD_REQUEST);
        }

        if (!force) {
            if (store.getClosedAt() != null) {
                throw new CustomException(
                        "ALREADY_CLOSED",
                        "이미 폐점된 매장입니다.",
                        HttpStatus.BAD_REQUEST
                );
            }

            if (store.getOpenAt() == null) {
                throw new CustomException(
                        "NOT_OPENED_CANNOT_CLOSE",
                        "오픈되지 않은 매장은 폐점할 수 없습니다.",
                        HttpStatus.BAD_REQUEST
                );
            }
            if (closedAt.isBefore(store.getOpenAt())) {
                throw new CustomException("폐점일은 오픈일보다 이전일 수 없습니다.", HttpStatus.BAD_REQUEST);
            }
        }

        storeMapper.updateClosedAt(storeId, closedAt);
        if (!closedAt.isAfter(LocalDateTime.now())) {
            adminMapper.deactivateStoreAdmins(storeId);
        }

        store.setClosedAt(closedAt);

        return new UpdateCloseDateResponse(
                storeId,
                closedAt,
                resolveStatus(store)
        );
    }

    public UpdateOpenDateResponse updateStoreOpenDate(
            Long storeId,
            LocalDateTime openAt,
            boolean force
    ) {

        Store store = storeMapper.findById(storeId);
        if (store == null) {
            throw new CustomException("매장을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        if (openAt == null) {
            throw new CustomException(
                    "OPEN_DATE_REQUIRED",
                    "오픈일은 필수입니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        LocalDate today = LocalDate.now();
        LocalDate openDate = openAt.toLocalDate();

        if (openDate.isBefore(today) && !force) {
            throw new CustomException(
                    "OPEN_DATE_PAST",
                    "과거 날짜 변경은 제한됩니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        StoreStatus status = resolveStatus(store);

        if (!force && status == StoreStatus.OPERATING && openDate.isAfter(today)) {
            throw new CustomException(
                    "OPERATING_TO_FUTURE",
                    "운영 중 매장의 오픈일을 미래로 변경할 수 없습니다.",
                    HttpStatus.CONFLICT
            );
        }

        storeMapper.updateOpenAt(storeId, openAt);

        store.setOpenAt(openAt);

        return new UpdateOpenDateResponse(
                storeId,
                openAt,
                resolveStatus(store)
        );
    }

    @Transactional
    public ResetPasswordResult resetPassword(ResetPasswordRequest request) {
        Admin admin = adminMapper.findByUsername(request.getUsername());
        Admin me = authService.getLoginAdmin();
        if (admin == null) {
            throw new CustomException("존재하지 않는 관리자입니다.", HttpStatus.NOT_FOUND);
        }
        if (me.getRole() != AdminRole.SUPER_ADMIN &&
                !me.getStoreId().equals(admin.getStoreId())) {
            throw new CustomException("권한 없음", HttpStatus.FORBIDDEN);
        }

        String tempPassword = generateTempPassword(8);

        admin.setPassword(passwordEncoder.encode(tempPassword));
        admin.setMustChangePassword(true);

        Long storeId = admin.getStoreId();
        Store store = storeMapper.findById(storeId);

        if (store == null) {
            throw new CustomException("매장 정보가 존재하지 않습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String storeName = store.getName();

        adminMapper.updatePasswordAndFlag(admin);
        discordService.sendPasswordResetRequest(
                me.getUsername(),
                admin.getUsername(),
                storeName
        );
        return new ResetPasswordResult(
                admin.getId(),
                admin.getUsername(),
                tempPassword,
                storeName
        );
    }

    @Transactional
    public CreateResult createStore(CreateRequest createRequest) {

        Store existingStore = storeMapper.findByName(createRequest.getStoreName());
        if (existingStore != null) {
            throw new CustomException("중복되는 지점명입니다.", HttpStatus.CONFLICT);
        }

        Store overlappingAddress = storeMapper.findByAddress(createRequest.getAddress());
        if (overlappingAddress != null) {
            throw new CustomException(
                    "이미 해당 장소에는 " + overlappingAddress.getName() + " 매장이 등록되어 있습니다.",
                    HttpStatus.CONFLICT
            );
        }
        String username = generateUsername(createRequest.getStoreName());
        String tempPassword = generateTempPassword(8);
        Store store = new Store();
        store.setName(createRequest.getStoreName());
        store.setRegion(createRequest.getRegion());
        store.setCity(createRequest.getCity());
        store.setDistrict(createRequest.getDistrict());
        store.setAddress(createRequest.getAddress());
        store.setIsActive(true);
        try {
            storeMapper.insertStore(store);
        } catch (Exception e) {
            System.out.println("INSERT ERROR 발생");
            e.printStackTrace();
            throw e;
        }

        // ✅ insert 이후 ID 확보
        Long storeId = store.getId();
        System.out.println("storeId = " + store.getId());

        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(tempPassword));
        admin.setRole(AdminRole.STORE_ADMIN);
        admin.setStoreId(storeId);
        admin.setIsActive(true);
        admin.setMustChangePassword(true);
        admin.setAdminStatus(AdminStatus.ACTIVE);

        adminMapper.insertAdmin(admin);

        return new CreateResult(
                storeId,
                createRequest.getStoreName(),
                username,
                tempPassword,
                createRequest.getRegion(),
                createRequest.getCity(),
                createRequest.getDistrict(),
                createRequest.getAddress()
        );
    }

    public List<RegionSummary> getAllRegionSummary() {
        return storeMapper.regionSummary();
    }

    private String normalize(String value) {
        return (value == null || value.trim().isEmpty()) ? null : value;
    }

    public Map<String, Object> getStoresWithPaging(
            String region,
            String subRegion,
            String status,
            int page,
            int size
    ) {
        region = normalize(region);
        subRegion = normalize(subRegion);
        status = normalize(status);

        int offset = page * size;

        List<Store> stores = storeMapper.findStoresPaged(
                region,
                subRegion,
                status,
                size,
                offset
        );

        int total = storeMapper.countStores(
                region,
                subRegion,
                status
        );

        List<StoreResult> content = stores.stream()
                .map(store -> {
                    StoreStatus resolvedStatus = resolveStatus(store); // 🔥 변수명 변경

                    return new StoreResult(
                            store.getId(),
                            store.getName(),
                            store.getRegion(),
                            Optional.ofNullable(store.getCity()).orElse(""),
                            Optional.ofNullable(store.getDistrict()).orElse(""),
                            store.getAddress(),
                            resolvedStatus
                    );
                })
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    public List<String> getSubRegionList(String region) {
        return storeMapper.findSubRegions(region);
    }

    public List<String> getRegionList() {
        return storeMapper.findRegions();
    }

    public List<String> getDistrictList(String region, String city) {
        return storeMapper.findDistricts(region, city);
    }

    public List<TempResponse> tempAdminList() {
        return adminMapper.selectTempAdminList();
    }

    public int countPendingStores() {
        return storeMapper.countFutureOpenStores();
    }

    public Map<String, Object> getAdminSummary() {
        return adminMapper.countAdminSummary();
    }

    public PendingStoreSummary getPendingStoreSummary(Integer limit) {

        int finalLimit = (limit == null || limit <= 0) ? 5 : limit;

        int count = storeMapper.countFutureOpenStores();
        List<PendingStoreInfo> stores = storeMapper.findPendingStoreInfo(finalLimit);

        return new PendingStoreSummary(count, stores);
    }

    public Map<String, Object> getMonthlyOpenSummary() {

        List<Store> opened = storeMapper.findThisMonthOpen();
        List<Store> upcoming = storeMapper.findThisMonthUpcoming();

        return Map.of(
                "opened", opened,
                "openedCount", opened.size(),
                "upcoming", upcoming,
                "upcomingCount", upcoming.size()
        );
    }


    public Map<String, Object> getStoreSummary() {
        return storeMapper.countStoreSummary();
    }
}

