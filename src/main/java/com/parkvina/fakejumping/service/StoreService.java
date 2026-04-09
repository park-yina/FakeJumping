package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.*;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
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

    public String generateTempPassword(int len) {
        SecureRandom secureRandom = new SecureRandom();
        /*
         * 1. 소문자의 범위 : 97 ~ 122
         * 2. 대문자의 범위 : 65 ~ 90
         * 3. 일부 허용 특수문자 : !@#$%^&_=+
         */
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
    public List<RegionSummary>getAllRegionSummary(){
        return storeMapper.regionSummary();
    }

    private String normalize(String value) {
        return (value == null || value.trim().isEmpty()) ? null : value;
    }
    public List<StoreResult> getAllStoreList(String region, String city, String district){

        region = normalize(region);
        city = normalize(city);
        district = normalize(district);

        return storeMapper.findStores(region, city, district)
                .stream()
                .map(store -> new StoreResult(
                        store.getId(),
                        store.getName(),
                        store.getRegion(),
                        Optional.ofNullable(store.getCity()).orElse(""),
                        Optional.ofNullable(store.getDistrict()).orElse(""),
                        store.getAddress(),
                        store.getIsActive() ? "운영중" : "폐점"
                ))
                .toList();
    }
    public List<String>getCityList(String region){
        return storeMapper.findCitiesByRegion(region);
    }
    public List<String>getRegionList(){
        return storeMapper.findRegions();
    }
    public List<String>getDistrictList(String region,String city){
        return storeMapper.findDistricts(region,city);
    }
    public List<TempResponse> tempAdminList() {
        return adminMapper.selectTempAdminList();
    }
    public int countPendingStores(){
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

    public Map<String, Object> getStoreSummary() {
        return storeMapper.countStoreSummary();
    }
}
