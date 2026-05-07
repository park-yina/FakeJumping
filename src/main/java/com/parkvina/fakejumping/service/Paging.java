package com.parkvina.fakejumping.service;

import lombok.Data;


public record Paging(int page, int size, int offset) {

    public static Paging of(int page, int size) {

        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > 100) size = 100;

        long offset = (long) page * size;

        if (offset > 10000) {
            throw new IllegalArgumentException("페이지 범위 초과");
        }

        return new Paging(page, size, (int) offset);
    }
}