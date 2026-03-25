package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.CreateRequest;
import com.parkvina.fakejumping.dto.CreateResult;
import com.parkvina.fakejumping.dto.TempResponse;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreMapper storeMapper;
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    public String generateTempPassword(int len){
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
    public String generateUsername(String storeName){
        return storeName + "_" + UUID.randomUUID().toString().substring(0, 4);

    }
    @Transactional
    public CreateResult createStore(CreateRequest createRequest) {

        if (storeMapper.findByName(createRequest.getStoreName()) != null) {
            throw new CustomException("중복되는 지점명입니다.", HttpStatus.CONFLICT);
        }

        String username = generateUsername(createRequest.getStoreName());
        String tempPassword = generateTempPassword(8);
        Store store = new Store();
        store.setName(createRequest.getStoreName());
        store.setRegion(createRequest.getRegion());
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
                createRequest.getAddress()
        );
    }
    public List<TempResponse> tempAdminList() {
        return adminMapper.selectTempAdminList();
    }
    public List<Store>readActiveStore(){
        return storeMapper.selectActiveStore();
    }
    public int countActiveStore(){
        return storeMapper.countActiveStore();
    }
}
