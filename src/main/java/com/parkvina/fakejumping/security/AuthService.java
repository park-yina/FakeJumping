package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.*;
import com.parkvina.fakejumping.dto.store.StoreSummary;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.AdminRefreshToken;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.mapper.TokenMapper;
import com.parkvina.fakejumping.service.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final TokenMapper tokenMapper;
    private final StoreMapper storeMapper;
    public Admin getLoginAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getPrincipal() == null) {
            throw new CustomException("인증 정보 없음", HttpStatus.UNAUTHORIZED);
        }

        Long adminId = (Long) auth.getPrincipal();

        Admin admin = adminMapper.findById(adminId);

        if (admin == null) {
            throw new CustomException("존재하지 않는 관리자", HttpStatus.UNAUTHORIZED);
        }

        return admin;
    }
    @Transactional
    public void changePassword(Long adminId, ChangePasswordRequest req) {

        Admin admin = adminMapper.findById(adminId);

        if (admin == null) {
            throw new RuntimeException("존재하지 않는 관리자입니다.");
        }
        // 🔥 비밀번호 암호화
        String encoded = passwordEncoder.encode(req.getNewPassword());

        admin.setPassword(encoded);
        admin.setMustChangePassword(false);

        adminMapper.updateAdminCredentials(admin);
    }
    @Transactional
    public TokenResult signIn(LoginRequest request) {

        Admin admin = adminMapper.findByUsername(request.getUsername());

        if (admin == null) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (admin.getPassword() == null) {
            throw new RuntimeException("DB에 비밀번호가 없음");
        }

        boolean match = passwordEncoder.matches(request.getPassword(), admin.getPassword());

        if (!match) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String accessToken = jwtUtils.createToken(
                admin.getId(),
                admin.getUsername(),
                admin.getRole(),
                admin.getStoreId()
        );

        String refreshToken = jwtUtils.createRefreshToken(
                admin.getId(),
                admin.getUsername(),
                admin.getRole(),
                admin.getStoreId()
        );

        tokenMapper.upsertRefreshToken(
                admin.getId(),
                refreshToken,
                LocalDateTime.now().plusDays(7)
        );

        Store store = storeMapper.findById(admin.getStoreId());

        StoreSummary storeSummary = null;
        if (store != null) {
            storeSummary = new StoreSummary();
            storeSummary.setId(store.getId());
            storeSummary.setName(store.getName());
        }

        LoginResponse response = new LoginResponse(
                accessToken,
                admin.getId(),
                admin.getUsername(),
                admin.getRole(),
                admin.getMustChangePassword(),
                storeSummary
        );

        return new TokenResult(response, refreshToken);
    }
    @Transactional
    public TokenResult reissueToken(String refreshToken){
        if (refreshToken == null || !jwtUtils.isValidToken(refreshToken)) {
            throw new CustomException("Refresh Token이 유효하지 않습니다.", HttpStatus.UNAUTHORIZED);
        }
        Long adminId = jwtUtils.getAdminId(refreshToken);
        AdminRefreshToken stored = tokenMapper.findByAdminId(adminId);


        if (!refreshToken.equals(stored.getRefreshToken())) {
            throw new CustomException("인증에 실패했습니다.", HttpStatus.UNAUTHORIZED);
        }
        String newRefreshToken = rotateRefreshToken(refreshToken);
        String username = jwtUtils.getUsername(newRefreshToken);
        AdminRole role = AdminRole.valueOf(jwtUtils.getRole(newRefreshToken));
        Long storeId=jwtUtils.getStoreId(refreshToken);
        String newAccessToken = jwtUtils.createToken(adminId, username, role,storeId);
        Admin admin = adminMapper.findById(adminId);
        Store store = storeMapper.findById(admin.getStoreId());
        StoreSummary storeSummary = null;

        if (store != null) {
            storeSummary = new StoreSummary();
            storeSummary.setId(store.getId());
            storeSummary.setName(store.getName());
        }
        LoginResponse response = new LoginResponse(
                newAccessToken,
                adminId,
                username,
                role,
                admin.getMustChangePassword(),
                storeSummary
        );
        return new TokenResult(response, newRefreshToken);

    }
    public String rotateRefreshToken(String refreshToken){
        if (refreshToken == null || !jwtUtils.isValidToken(refreshToken)) {
            throw new RuntimeException("Refresh Token 이 유효하지 않습니다.");
        }
        Long adminId = jwtUtils.getAdminId(refreshToken);
        Long storeId=jwtUtils.getStoreId(refreshToken);

        AdminRefreshToken stored = tokenMapper.findByAdminId(adminId);
        if (stored == null) {
            throw new RuntimeException("저장된 토큰 없음");
        }
        if (!refreshToken.equals(stored.getRefreshToken())) {
            throw new RuntimeException("토큰 불일치 (탈취 가능)");
        }

        String username = jwtUtils.getUsername(refreshToken);
        AdminRole role = AdminRole.valueOf(jwtUtils.getRole(refreshToken));
        String newToken = jwtUtils.createRefreshToken(adminId, username, role,storeId);
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);
        tokenMapper.upsertRefreshToken(adminId, newToken, expiresAt);

        return newToken;
    }

}