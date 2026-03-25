package com.parkvina.fakejumping.security;

import com.parkvina.fakejumping.service.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    private final JwtUtils jwtUtils;

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
        System.out.println("🔥 [FILTER] Authorization = " + request.getHeader("Authorization"));
        System.out.println("🔥 [FILTER] token = " + token);
        if (token != null && jwtUtils.isValidToken(token)) {
            System.out.println("🔥 [FILTER] 토큰 유효함 → 인증 세팅");

            Authentication authentication = jwtUtils.getAuthentication(token);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);

            SecurityContextHolder.setContext(context);

            System.out.println("🔥 [FILTER] auth = " + authentication);
        } else {
            System.out.println("🔥 [FILTER] 토큰 없음 또는 유효하지 않음");
        }

        filterChain.doFilter(request, response);
    }
}