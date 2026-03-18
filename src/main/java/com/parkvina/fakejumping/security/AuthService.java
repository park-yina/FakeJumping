package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.dto.LoginRequest;
import com.parkvina.fakejumping.dto.LoginResponse;
import com.parkvina.fakejumping.dto.TokenResult;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.AdminRefreshToken;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.TokenMapper;
import com.parkvina.fakejumping.service.JwtUtils;
import lombok.RequiredArgsConstructor;
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
    @Transactional
    public TokenResult signIn(LoginRequest request) {

        Admin admin = adminMapper.findByUsername(request.getUsername());

        if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String accessToken = jwtUtils.createToken(
                admin.getId(),
                admin.getUsername(),
                admin.getRole()
        );

        String refreshToken = jwtUtils.createRefreshToken(
                admin.getId(),
                admin.getUsername(),
                admin.getRole()
        );

        tokenMapper.upsertRefreshToken(
                admin.getId(),
                refreshToken,
                LocalDateTime.now().plusDays(7)
        );

        LoginResponse response = new LoginResponse(
                accessToken,
                admin.getId(),
                admin.getUsername(),
                admin.getRole(),
                Boolean.TRUE.equals(admin.getMustChangePassword())
        );

        return new TokenResult(response, refreshToken);
    }
    @Transactional
    public TokenResult reissueToken(String refreshToken){
        Long adminId = jwtUtils.getAdminId(refreshToken);

        AdminRefreshToken stored = tokenMapper.findByAdminId(adminId);
        if (refreshToken == null || !jwtUtils.isValidToken(refreshToken)) {
            throw new RuntimeException("Refresh Token 이 유효하지 않습니다.");
        }
        if (!refreshToken.equals(stored.getRefreshToken())) {
            throw new RuntimeException("토큰 불일치");
        }
        String newRefreshToken = rotateRefreshToken(refreshToken);
        String username = jwtUtils.getUsername(newRefreshToken);
        AdminRole role = AdminRole.valueOf(jwtUtils.getRole(newRefreshToken));
        String newAccessToken = jwtUtils.createToken(adminId, username, role);
        Admin admin = adminMapper.findById(adminId);
        LoginResponse response = new LoginResponse(
                newAccessToken,
                adminId,
                username,
                role,
                Boolean.TRUE.equals(admin.getMustChangePassword())
        );
        return new TokenResult(response, refreshToken);

    }
    public String rotateRefreshToken(String refreshToken){
        if (refreshToken == null || !jwtUtils.isValidToken(refreshToken)) {
            throw new RuntimeException("Refresh Token 이 유효하지 않습니다.");
        }
        Long adminId = jwtUtils.getAdminId(refreshToken);

        AdminRefreshToken stored = tokenMapper.findByAdminId(adminId);
        if (stored == null) {
            throw new RuntimeException("저장된 토큰 없음");
        }
        if (!refreshToken.equals(stored.getRefreshToken())) {
            throw new RuntimeException("토큰 불일치 (탈취 가능)");
        }

        String username = jwtUtils.getUsername(refreshToken);
        AdminRole role = AdminRole.valueOf(jwtUtils.getRole(refreshToken));
        String newToken = jwtUtils.createRefreshToken(adminId, username, role);
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);
        tokenMapper.upsertRefreshToken(adminId, newToken, expiresAt);

        return newToken;
    }

}