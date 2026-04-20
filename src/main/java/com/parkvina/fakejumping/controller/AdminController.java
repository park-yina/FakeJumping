package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.*;
import com.parkvina.fakejumping.dto.store.PendingStoreSummary;
import com.parkvina.fakejumping.dto.store.StoreResult;
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
    private final StoreService storeService;
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/admin/summary-store")
    public Map<String, Object> getStoreSummary() {
        return storeService.getStoreSummary();
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping()
    public ResponseEntity<List<StoreResult>>findStores(
            @RequestParam(required = false)String region,
            @RequestParam(required = false)String city,
            @RequestParam(required = false)String district
    ){
        List<StoreResult> result = storeService.getAllStoreList(region, city, district);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/admin/reset-password")
    public ResponseEntity<ResetPasswordResult> adminResetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        ResetPasswordResult resetPasswordResult = storeService.resetPassword(resetPasswordRequest);
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

    @GetMapping("/stores")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<StoreResult>> getAllStores(@RequestParam(required = false) String region,
                                                          @RequestParam(required = false) String city,
                                                          @RequestParam(required = false) String district
    ) {
        List<StoreResult> storeResultList = storeService.getAllStoreList(region, city, district);
        return ResponseEntity.status(HttpStatus.OK).body(storeResultList);

    }

    @GetMapping("/stores/region-summary")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<RegionSummary>> getAllRegionSummary() {
        List<RegionSummary> regionSummaryList = storeService.getAllRegionSummary();
        return ResponseEntity.status(HttpStatus.OK).body(regionSummaryList);
    }

    @GetMapping("/stores/pending-summary")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<PendingStoreSummary> getPendingStoreSummary(@RequestParam(required = false) Integer limit) {
        PendingStoreSummary pendingStoreSummary = storeService.getPendingStoreSummary(limit);
        return ResponseEntity.status(HttpStatus.OK).body(pendingStoreSummary);
    }
    @GetMapping("/stores/monthly-summary")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getMonthlySummary() {

        Map<String, Object> result = storeService.getMonthlyOpenSummary();

        return ResponseEntity.status(HttpStatus.OK).body(result);
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
