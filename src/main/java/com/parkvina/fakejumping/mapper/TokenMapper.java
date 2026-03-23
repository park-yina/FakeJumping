package com.parkvina.fakejumping.mapper;

import com.parkvina.fakejumping.entity.AdminRefreshToken;
import org.apache.ibatis.annotations.*;
import org.springframework.jmx.export.annotation.ManagedNotification;

import java.time.LocalDateTime;

@Mapper
public interface TokenMapper {
    @Select("""
        SELECT 
            id,
            admin_id AS adminId,
            refresh_token AS refreshToken,
            expires_at AS expiresAt,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM admin_refresh_token
        WHERE admin_id = #{adminId}
    """)
    AdminRefreshToken findByAdminId(@Param("adminId") Long adminId);
    @Insert("""
INSERT INTO admin_refresh_token (admin_id, refresh_token, expires_at)
VALUES (#{adminId}, #{refreshToken}, #{expiresAt})
ON DUPLICATE KEY UPDATE
    refresh_token = #{refreshToken},
    expires_at = #{expiresAt},
    updated_at = NOW()
""")
    void upsertRefreshToken(
            @Param("adminId") Long adminId,
            @Param("refreshToken") String refreshToken,
            @Param("expiresAt") LocalDateTime expiresAt
    );
    @Delete(
            """
DELETE FROM admin_refresh_token
WHERE admin_id=#{adminId}
"""
    )
    void deleteRefreshToken(
            @Param("adminId")Long adminId
    );

}
