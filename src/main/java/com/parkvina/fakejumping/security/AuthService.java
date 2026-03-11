package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.dto.LoginRequest;
import com.parkvina.fakejumping.dto.LoginResponse;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.service.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

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
                admin.getUsername(),
                admin.getRole(),
                admin.getMustChangePassword()
        );
    }
}