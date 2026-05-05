package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.enums.AdminStatus;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.service.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtils jwtUtils;
    private final AdminMapper adminMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();

        // 로그인 페이지 / 로그인 API / 정적 리소스는 JWT 검사 제외
        if (path.equals("/sign-in")
                || path.equals("/auth/sign-in")
                || path.startsWith("/css")
                || path.startsWith("/js")
                || path.startsWith("/images")
                || path.equals("/auth/refresh")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = jwtUtils.resolveToken(request);
        if (token != null && jwtUtils.isValidToken(token)) {

            Long adminId = jwtUtils.getAdminId(token);

            Admin admin = adminMapper.findById(adminId);

            if (admin == null) {
                log.debug("[AUTH] 존재하지 않는 관리자");
                filterChain.doFilter(request, response);
                return;
            }

            if (admin.getAdminStatus() == AdminStatus.INACTIVE) {
                log.debug("[AUTH] 비활성화된 계정 접근 차단");

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"비활성화된 계정입니다.\"}");
                return; // 🔥 이거 없어서 문제


            }

            Authentication authentication = jwtUtils.getAuthentication(token);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

        }
          else {
            log.debug("[AUTH] 토큰 없음 또는 유효하지 않음");
        }
        filterChain.doFilter(request, response);
    }
}