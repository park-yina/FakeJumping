package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.dto.store.MyStoreSummary;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
}
