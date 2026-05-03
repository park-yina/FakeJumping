package com.parkvina.fakejumping.entity;

import com.parkvina.fakejumping.enums.LedColor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Tile {
    private Long id;
    private Long deviceId;
    private int position;

    private LedColor color;      // RED / BLUE / GREEN / NULL
    private Boolean isPressed;

    private LocalDateTime updatedAt;
}