package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class StoreScheduler {

    private final StoreMapper storeMapper;
    private final AdminMapper adminMapper;

    @PostConstruct
    public void init() {
        log.info("[Scheduler] 초기 실행 시작 - 폐점 매장 관리자 동기화");
        processClosingStores();
        log.info("[Scheduler] 초기 실행 완료");
    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public void processClosingStores() {

        LocalDateTime now = LocalDateTime.now();
        log.info("[Scheduler] 폐점 매장 처리 시작 - 기준 시간: {}", now);

        List<Long> storeIds = storeMapper.findStoresToDeactivateAdmins(now);

        log.info("[Scheduler] 처리 대상 매장 수: {}", storeIds.size());

        for (Long storeId : storeIds) {
            adminMapper.deactivateStoreAdmins(storeId);
            log.info("[Scheduler] 매장 관리자 비활성화 완료 - storeId: {}", storeId);
        }

        log.info("[Scheduler] 폐점 매장 처리 완료");
    }
}
