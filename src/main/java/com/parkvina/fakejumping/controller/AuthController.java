package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.LoginRequest;
import com.parkvina.fakejumping.dto.LoginResponse;
import com.parkvina.fakejumping.security.AuthService;
import com.parkvina.fakejumping.service.JwtUtils;
import io.jsonwebtoken.Jwt;
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
    @PostMapping("/sign-in")
    public ResponseEntity<LoginResponse> signIn(@RequestBody LoginRequest request) {

        LoginResponse response = authService.signIn(request);

        return ResponseEntity.ok(response);
    }

}
