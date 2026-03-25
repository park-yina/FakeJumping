package com.parkvina.fakejumping.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
    @GetMapping("/sign-inView")
    public String signInPage() {
        return "sign-in";
    }
    @GetMapping("/change-password")
    public String changePasswordPage(){
        return "change-password";
    }
}

