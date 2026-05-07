package com.parkvina.fakejumping.mapper;

import com.parkvina.fakejumping.entity.Device;
import com.parkvina.fakejumping.enums.DeviceStatus;
import com.parkvina.fakejumping.enums.DeviceType;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface DeviceMapper {
    @Insert("""
            INSERT INTO device
            (
                store_id,
                device_uuid,
                device_name,
                device_type,
                is_active
            )
            VALUES
            (
                #{storeId},
                #{deviceUuid},
                #{deviceName},
                #{deviceType},
                1
            )
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertDevice(Device device);

    @Select("""
                SELECT device_name
                FROM device
                WHERE device_name = #{baseName}
                   OR device_name LIKE CONCAT(#{baseName}, ' (%')
            """)
    List<String> findNamesByPrefix(
            @Param("baseName") String baseName
    );

    @Update("""
            UPDATE device
            SET serial_number = #{serialNumber}
            WHERE id = #{id}
            """)
    void updateSerial(@Param("id") Long id,
                      @Param("serialNumber") String serialNumber);

    List<Device> findDevicesPaged(
            @Param("assigned") Boolean assigned,
            @Param("deviceType") DeviceType deviceType,
            @Param("status") DeviceStatus status,
            @Param("storeId") Long storeId,
            @Param("size") int size,
            @Param("offset") int offset,
            @Param("onlineSeconds") int onlineSeconds
    );

    int countDevices(
            @Param("assigned") Boolean assigned,
            @Param("deviceType") DeviceType deviceType,
            @Param("status") DeviceStatus status,
            @Param("storeId") Long storeId
    );
}
