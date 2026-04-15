package com.parkvina.fakejumping.dto.store;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OpenDateRequest {
    private LocalDateTime openAt;

}
