package com.parkvina.fakejumping.dto.device;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DeviceDeleteRequest {
    private List<Long> ids;
    private boolean force;
}
