package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.store.MyStoreSummary;
import com.parkvina.fakejumping.dto.store.OpenDateRequest;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.service.MyStoreService;
import com.parkvina.fakejumping.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreAdminController {
    private final StoreService storeService;
    private final StoreMapper storeMapper;
    private final AdminMapper adminMapper;
    private final MyStoreService myStoreService;

    @PreAuthorize("hasRole('STORE_ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<MyStoreSummary> getMyStoreSummary(Authentication authentication) {

        Long adminId = (Long) authentication.getPrincipal();

        Admin admin = adminMapper.findById(adminId);

        if (admin == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        Long storeId = admin.getStoreId();

        if (storeId == null) {
            throw new RuntimeException("매장이 없는 관리자입니다.");
        }

        MyStoreSummary summary = storeMapper.findMyStoreSummary(storeId);
        if (summary == null) {
            throw new RuntimeException("매장 정보를 찾을 수 없습니다.");
        }
        return ResponseEntity.ok(summary);
    }

    @PreAuthorize("hasRole('STORE_ADMIN')")
    @PutMapping("/me/open-date")
    public ResponseEntity<MyStoreSummary> updateOpenDate(
            Authentication authentication,
            @RequestBody OpenDateRequest request
    ) {
        Long adminId = (Long) authentication.getPrincipal();

        MyStoreSummary result = myStoreService.updateOpenDate(
                adminId,
                request.getOpenAt(),
                request.getForce()
        );

        return ResponseEntity.ok(result);
    }
}
