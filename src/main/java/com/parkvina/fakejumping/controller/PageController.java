package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.mapper.AdminMapper;
import com.parkvina.fakejumping.mapper.StoreMapper;
import com.parkvina.fakejumping.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor

public class PageController {
    private final AdminMapper adminMapper;
    private final StoreMapper storeMapper;

    @GetMapping("/sign-inView")
    public String signInPage() {
        return "sign-in";
    }
    @GetMapping("/change-password")
    public String changePasswordPage() {
        return "change-password";
    }
}

