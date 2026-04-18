package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.store.MyStoreSummary;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MyStoreService {
    private final StoreMapper storeMapper;
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final DiscordService discordService;
    private final AuthService authService;
    public MyStoreSummary myStoreSummary(Long storeId){
        return storeMapper.findMyStoreSummary(storeId);
    }
    public MyStoreSummary updateOpenDate(Long adminId, LocalDateTime openAt, boolean force) {

        Admin admin = adminMapper.findById(adminId);
        if (admin == null) {
            throw new CustomException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        Long storeId = admin.getStoreId();

        if (openAt == null) {
            throw new CustomException("오픈일은 필수입니다.", HttpStatus.BAD_REQUEST);
        }

        LocalDate today = LocalDate.now();
        LocalDate openDate = openAt.toLocalDate();

        Store store = storeMapper.findById(storeId);
        if (store == null) {
            throw new CustomException("매장을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        if (openDate.isBefore(today)) {
            throw new CustomException(
                    "OPEN_DATE_PAST",
                    "과거 날짜로 변경은 데이터 정합성 문제로 인해 제한됩니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (isOperating(store) && openDate.isAfter(today) && !force) {
            throw new CustomException(
                    "OPERATING_TO_FUTURE",
                    "운영 중 매장의 오픈일을 미래로 변경하면 데이터에 영향을 줄 수 있습니다.",
                    HttpStatus.CONFLICT
            );
        }

        storeMapper.updateOpenAt(storeId, openAt);

        return storeMapper.findMyStoreSummary(storeId);
    }

    private boolean isOperating(Store store) {

        if (store.getOpenAt() == null) return false;
        if (store.getClosedAt() != null) return false;

        return store.getOpenAt().isBefore(LocalDateTime.now());
    }
}
