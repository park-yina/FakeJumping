package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.*;
import com.parkvina.fakejumping.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdminController {
    //private final AuthService authService;
    private final StoreService storeService;
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/admin/summary-store")
    public Map<String,Object> getStoreSummary() {
       return  storeService.getStoreSummary();
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/admin/reset-password")
    public ResponseEntity<ResetPasswordResult>adminResetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest){
        ResetPasswordResult resetPasswordResult=storeService.resetPassword(resetPasswordRequest);
        return ResponseEntity.status(HttpStatus.OK).body(resetPasswordResult);
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/stores")
    public ResponseEntity<CreateResult> makeStore(@RequestBody CreateRequest createRequest) {
        CreateResult createResult = storeService.createStore(createRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createResult);

    }

    @GetMapping("/admin/temp")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<TempResponse>> tempAdminList() {
        List<TempResponse> tempResponsesList = storeService.tempAdminList();
        return ResponseEntity.status(HttpStatus.OK).body(tempResponsesList);
    }

    @GetMapping("/admin/temp/count")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Map<String, Object> tempAdminCount() {
        return storeService.getAdminSummary();
    }

}
