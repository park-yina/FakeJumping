package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscordService {

    private final StoreMapper storeMapper;
    private final AdminMapper adminMapper;
    @Value("${WEB_HOOK}")
    private String webhookUrl;

    private final WebClient webClient = WebClient.create();

    public void sendPasswordResetRequest(String requester, String target, String storeName) {

        Map<String, Object> embed = Map.of(
                "title", "🚨 비밀번호 초기화 요청",
                "description", "관리자 비밀번호 초기화 요청이 발생했습니다.",
                "color", 16711680,
                "fields", List.of(
                        Map.of("name", "요청자", "value", requester, "inline", true),
                        Map.of("name", "대상자", "value", target, "inline", true),
                        Map.of("name", "매장", "value", storeName, "inline", false)
                ),
                "footer", Map.of("text", "FakeJumping Admin System")
        );

        Map<String, Object> payload = Map.of(
                "embeds", List.of(embed)
        );

        webClient.post()
                .uri(webhookUrl)
                .bodyValue(payload)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> {
                            log.error("❌ Discord 전송 실패");
                            return response.bodyToMono(String.class)
                                    .flatMap(error -> Mono.error(new RuntimeException(error)));
                        }
                )
                .bodyToMono(String.class)
                .doOnSuccess(res -> log.info("✅ Discord 전송 성공"))
                .doOnError(err -> log.error("❌ Discord 전송 에러", err))
                .subscribe(); // 비동기
    }
    public void sendContactRequest(String requester, String storeName, String content) {

        Map<String, Object> embed = Map.of(
                "title", "📩 매장 문의 접수",
                "description", storeName + "에서 문의가 들어왔습니다.",
                "color", 5814783,
                "fields", List.of(
                        Map.of("name", "요청자", "value", requester, "inline", true),
                        Map.of("name", "매장", "value", storeName, "inline", true),
                        Map.of("name", "문의 내용", "value", content, "inline", false)
                ),
                "footer", Map.of("text", "FakeJumping Contact System")
        );

        Map<String, Object> payload = Map.of(
                "embeds", List.of(embed)
        );

        webClient.post()
                .uri(webhookUrl)
                .bodyValue(payload)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> {
                            log.error("❌ 문의 Discord 전송 실패");
                            return response.bodyToMono(String.class)
                                    .flatMap(error -> Mono.error(new RuntimeException(error)));
                        }
                )
                .bodyToMono(String.class)
                .doOnSuccess(res -> log.info("✅ 문의 Discord 전송 성공"))
                .doOnError(err -> log.error("❌ 문의 Discord 전송 에러", err))
                .subscribe();
    }
}