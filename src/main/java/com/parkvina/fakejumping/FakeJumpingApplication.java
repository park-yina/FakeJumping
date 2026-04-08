package com.parkvina.fakejumping;


import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.parkvina.fakejumping.mapper")
public class FakeJumpingApplication {

    public static void main(String[] args) {
        SpringApplication.run(FakeJumpingApplication.class, args);
    }
    }
