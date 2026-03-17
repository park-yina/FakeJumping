package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.LoginRequest;
import com.parkvina.fakejumping.dto.LoginResponse;
import com.parkvina.fakejumping.security.AuthService;
import com.parkvina.fakejumping.service.JwtUtils;
import io.jsonwebtoken.Jwt;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    @PostMapping("/sign-in")
    public ResponseEntity<LoginResponse> signIn(@RequestBody LoginRequest request, HttpServletResponse response) {

        LoginResponse loginResponse = authService.signIn(request);
        String refreshToken = jwtUtils.createRefreshToken(loginResponse.getAdminId(),loginResponse.getUsername(),loginResponse.getRole() );

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24 * 7); // 7일

        response.addCookie(cookie);

        return ResponseEntity.ok(loginResponse);
    }
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse>refresh(HttpServletRequest request){
        String refreshToken=jwtUtils.extractRefreshTokenFromCookie(request);
        return ResponseEntity.ok(authService.reissueToken(refreshToken));
    }

}
