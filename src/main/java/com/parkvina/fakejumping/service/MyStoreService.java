package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.dto.store.MyStoreSummary;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
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
    public MyStoreSummary updateOpenDate(Long adminId,LocalDateTime openAt){
        Admin admin = adminMapper.findById(adminId);

        if (admin == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        Long storeId=admin.getStoreId();

        if (openAt == null) {
            throw new RuntimeException("오픈일은 필수입니다.");
        }

        if (openAt.toLocalDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("과거 날짜로 오픈을 원할 때에는 전체 관리자에게 문의해주세요");
        }

        storeMapper.updateOpenAt(storeId, openAt);

        return storeMapper.findMyStoreSummary(storeId);
    }
}
