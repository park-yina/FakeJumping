package com.parkvina.fakejumping.controller;

import com.parkvina.fakejumping.dto.CreateRequest;
import com.parkvina.fakejumping.dto.CreateResult;
import com.parkvina.fakejumping.entity.Store;
import com.parkvina.fakejumping.security.AuthService;
import com.parkvina.fakejumping.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    //private final AuthService authService;
    private final StoreService storeService;
    @PreAuthorize("hasRole('SUPER_ADMIN')")

    @PostMapping("/stores")
    public ResponseEntity<CreateResult>makeStore(@RequestBody CreateRequest createRequest){

        CreateResult createResult=storeService.createStore(createRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createResult);

    }
}
