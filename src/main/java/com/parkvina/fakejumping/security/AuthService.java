package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.dto.LoginRequest;
import com.parkvina.fakejumping.dto.LoginResponse;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.enums.AdminRole;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.service.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    @Transactional
    public LoginResponse signIn(LoginRequest request) {

        Admin admin = adminMapper.findByUsername(request.getUsername());

        if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String accessToken = jwtUtils.createToken(
                admin.getId(),
                admin.getUsername(),
                admin.getRole()
        );

        return new LoginResponse(
                accessToken,
                admin.getId(),
                admin.getUsername(),
                admin.getRole(),
                admin.getMustChangePassword()
        );
    }
    @Transactional
    public LoginResponse reissueToken(String refreshToken){
        if (refreshToken == null || !jwtUtils.isValidToken(refreshToken)) {
            throw new RuntimeException("Refresh Token 이 유효하지 않습니다.");
        }
        Long adminId=jwtUtils.getAdminId(refreshToken);
        String userName=jwtUtils.getUsername(refreshToken);
        AdminRole role=AdminRole.valueOf(jwtUtils.getRole(refreshToken));
        String newAccessToken= jwtUtils.createToken(adminId,userName,role);
        Admin admin = adminMapper.findById(adminId);
        Boolean mustChangePassword = admin.getMustChangePassword();
        return new LoginResponse(
                newAccessToken,
                adminId,
                userName,
                role,
                mustChangePassword

        );

    }

}