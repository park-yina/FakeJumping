package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.AdminInfoResponse;
import com.parkvina.fakejumping.dto.LoginRequest;
import com.parkvina.fakejumping.dto.LoginResponse;
import com.parkvina.fakejumping.dto.TokenResult;
import com.parkvina.fakejumping.enums.AdminRole;
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

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    @GetMapping("/me")
    public ResponseEntity<AdminInfoResponse> me(Authentication authentication) {

        String username = authentication.getName();

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority(); // ROLE_SUPER_ADMIN

        AdminRole adminRole = AdminRole.valueOf(role.replace("ROLE_", ""));

        return ResponseEntity.ok(
                new AdminInfoResponse(username, adminRole)
        );
    }
    @PostMapping("/sign-in")
    public ResponseEntity<LoginResponse> signIn(@RequestBody LoginRequest request, HttpServletResponse response) {
        TokenResult tokenResult = authService.signIn(request);


        Cookie cookie = getCookie(tokenResult.getRefreshToken());
        response.addCookie(cookie);
        return ResponseEntity.ok(tokenResult.getLoginResponse());

    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(HttpServletRequest request,
                                                 HttpServletResponse response) {
        String refreshToken = jwtUtils.extractRefreshTokenFromCookie(request);

        TokenResult tokenResult = authService.reissueToken(refreshToken);
        Cookie cookie = getCookie(tokenResult.getRefreshToken());

        response.addCookie(cookie);

        return ResponseEntity.ok(tokenResult.getLoginResponse());
    }

    private static @NonNull Cookie getCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(true);
        cookie.setMaxAge(60 * 60 * 24 * 7); // 7일
        return cookie;
    }

}
