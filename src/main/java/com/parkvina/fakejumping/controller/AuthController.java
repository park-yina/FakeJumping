package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.*;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.security.AuthService;
import com.parkvina.fakejumping.service.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.awt.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final AdminMapper adminMapper;
    private final StoreMapper storeMapper;

    @GetMapping("/me")
    public ResponseEntity<AdminInfoResponse> me(Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("인증 정보 없음");
        }

        Long adminId = (Long) authentication.getPrincipal();

        Admin admin = adminMapper.findById(adminId);

        if (admin == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        String storeName = null;
        Long storeId = null;

        if (admin.getRole() == AdminRole.STORE_ADMIN) {
            Store store = storeMapper.findById(admin.getStoreId());

            if (store == null) {
                throw new RuntimeException("지점을 찾을 수 없습니다.");
            }

            storeName = store.getName();
            storeId=store.getId();
        }

        return ResponseEntity.ok(
                new AdminInfoResponse(
                        admin.getUsername(),
                        admin.getRole(),
                        admin.getMustChangePassword(),
                        storeName,
                        storeId
                )
        );
    }

    @PostMapping("/sign-in")
    public ResponseEntity<LoginResponse> signIn(@RequestBody LoginRequest request, HttpServletResponse response) {
        TokenResult tokenResult = authService.signIn(request);


        String cookieHeader = buildRefreshTokenCookie(tokenResult.getRefreshToken());
        response.setHeader("Set-Cookie", cookieHeader);
        return ResponseEntity.ok(tokenResult.getLoginResponse());

    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(HttpServletRequest request,
                                                 HttpServletResponse response) {
        String refreshToken = jwtUtils.extractRefreshTokenFromCookie(request);

        TokenResult tokenResult = authService.reissueToken(refreshToken);
        String cookieHeader = buildRefreshTokenCookie(tokenResult.getRefreshToken());
        response.setHeader("Set-Cookie", cookieHeader);

        return ResponseEntity.ok(tokenResult.getLoginResponse());
    }

    private String buildRefreshTokenCookie(String refreshToken) {
        return "refreshToken=" + refreshToken +
                "; Path=/" +
                "; HttpOnly" +
                "; SameSite=Lax" +   //CSRF 방어 (HTTP 환경)
                "; Max-Age=" + (60 * 60 * 24 * 7);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest req,
            Authentication authentication
    ) {

        Long adminId = (Long) authentication.getPrincipal();
        authService.changePassword(adminId, req);

        return ResponseEntity.ok().build();
    }
}
