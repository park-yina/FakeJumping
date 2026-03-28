package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.controller.CustomException;
import com.parkvina.fakejumping.dto.*;
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

    @Transactional
    public void changePassword(Long adminId, ChangePasswordRequest req) {

        Admin admin = adminMapper.findById(adminId);

        if (admin == null) {
            throw new RuntimeException("존재하지 않는 관리자입니다.");
        }
        Admin exist = adminMapper.findByUsername(req.getNewUsername());
        if (exist != null && !exist.getId().equals(adminId)) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        // 🔥 비밀번호 암호화
        String encoded = passwordEncoder.encode(req.getNewPassword());

        admin.setUsername(req.getNewUsername());
        admin.setPassword(encoded);
        admin.setMustChangePassword(false);

        adminMapper.updateAdminCredentials(admin);
    }@Transactional
    public TokenResult signIn(LoginRequest request) {

        System.out.println("🔥 [SIGN-IN] 요청 시작");

        try {
            Admin admin = adminMapper.findByUsername(request.getUsername());

            System.out.println("DB 조회 결과: " + admin);

            if (admin == null) {
                System.out.println("사용자 없음");
                throw new IllegalArgumentException("Invalid username or password");
            }

            if (admin.getPassword() == null) {
                System.out.println("❌ DB 비밀번호 null");
                throw new RuntimeException("DB에 비밀번호가 없음");
            }

            boolean match = passwordEncoder.matches(request.getPassword(), admin.getPassword());
            System.out.println("👉 password match 결과: " + match);

            if (!match) {
                System.out.println("❌ 비밀번호 불일치");
                throw new IllegalArgumentException("Invalid username or password");
            }

            System.out.println("✅ 로그인 검증 통과");

            String accessToken = jwtUtils.createToken(
                    admin.getId(),
                    admin.getUsername(),
                    admin.getRole()
            );

            System.out.println("👉 accessToken 생성 완료");

            String refreshToken = jwtUtils.createRefreshToken(
                    admin.getId(),
                    admin.getUsername(),
                    admin.getRole()
            );

            System.out.println("👉 refreshToken 생성 완료");

            tokenMapper.upsertRefreshToken(
                    admin.getId(),
                    refreshToken,
                    LocalDateTime.now().plusDays(7)
            );

            System.out.println("👉 refreshToken DB 저장 완료");
            Store store = storeMapper.findById(admin.getStoreId());
            StoreSummary storeSummary=null;
            if(store!=null){
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
                    storeSummary // 👈 여기 추가

            );

            System.out.println("🔥 [SIGN-IN] 정상 종료");

            return new TokenResult(response, refreshToken);

        } catch (Exception e) {
            System.out.println("🔥 [SIGN-IN ERROR] 발생");
            e.printStackTrace(); // 🔥 핵심 (이거로 원인 바로 잡힘)
            throw e;
        }
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
        String newAccessToken = jwtUtils.createToken(adminId, username, role);
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