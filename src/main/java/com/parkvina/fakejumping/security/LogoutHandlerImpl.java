package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.mapper.TokenMapper;
import com.parkvina.fakejumping.service.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class LogoutHandlerImpl implements LogoutHandler {
    private final JwtUtils jwtUtils;
    private final TokenMapper tokenMapper;

    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {

        String token = jwtUtils.resolveToken(request);

        if (token != null && jwtUtils.isValidToken(token)) {
            Long adminId = jwtUtils.getAdminId(token);

            // 🔥 refreshToken 삭제
            tokenMapper.deleteRefreshToken(adminId);
        }
    }
}