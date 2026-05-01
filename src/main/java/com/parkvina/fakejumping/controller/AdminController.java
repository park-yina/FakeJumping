package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.*;
import com.parkvina.fakejumping.dto.login.ResetPasswordRequest;
import com.parkvina.fakejumping.dto.login.ResetPasswordResult;
import com.parkvina.fakejumping.dto.store.*;
import com.parkvina.fakejumping.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.apache.ibatis.annotations.Update;
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
    @GetMapping("/stores/regions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<String>> getRegions() {
        return ResponseEntity.ok(storeService.getRegionList());
    }

    @GetMapping("/stores/sub-regions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<String>> getSubRegions(
            @RequestParam(required = false) String region
    ) {
        return ResponseEntity.status(HttpStatus.OK).body(storeService.getSubRegionList(region));
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/stores")
    public ResponseEntity<Map<String, Object>> findStores(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String subRegion,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        // 🔥 status 정리 (선택)
        if (status != null) {
            status = status.toUpperCase();
        }

        Map<String, Object> result =
                storeService.getStoresWithPaging(region, subRegion, status, page, size);

        return ResponseEntity.ok(result);
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
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/stores/{storeId}/open-date")
    public ResponseEntity<UpdateOpenDateResponse>updateStoreOpenDate(
            @RequestBody OpenDateRequest req,
            @PathVariable Long storeId
            ){
        UpdateOpenDateResponse updateOpenDateResponse=storeService.updateStoreOpenDate(storeId,req.getOpenAt(),req.getForce());
        return ResponseEntity.status(HttpStatus.OK).body(updateOpenDateResponse);

    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/admin/kpi/stores")
    public ResponseEntity<StoreKpiResponse>getStoreKpi() {
        StoreKpiResponse storeKpiResponse = storeService.getStoreKpi();
        return ResponseEntity.status(HttpStatus.OK).body(storeKpiResponse);
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/stores/{storeId}/close")
    public ResponseEntity<UpdateCloseDateResponse> closeStore(
            @PathVariable Long storeId,
            @RequestBody ClosedDateRequest req
    ) {
        UpdateCloseDateResponse res =
                storeService.closeStore(storeId, req.getClosedAt(), req.getForce());

        return ResponseEntity.ok(res);
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/stores/{storeId}/reopen")
    public ResponseEntity<UpdateCloseDateResponse>reopenStore(
            @PathVariable Long storeId
    ){
        UpdateCloseDateResponse res=storeService.reopenStore(storeId);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/stores/{storeId}/closed-date")
    public ResponseEntity<UpdateCloseDateResponse> updateCloseDate(
            @PathVariable Long storeId,
            @RequestBody ClosedDateRequest req
    ) {
        UpdateCloseDateResponse res =
                storeService.updateCloseDate(storeId, req.getClosedAt());

        return ResponseEntity.ok(res);
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
