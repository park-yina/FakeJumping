package com.parkvina.fakejumping.mapper;

import com.parkvina.fakejumping.dto.TempResponse;
import com.parkvina.fakejumping.entity.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminMapper {
    @Select("""
                SELECT *
                FROM admin
                WHERE username = #{username}
            """)
    Admin findByUsername(String username);

    @Select("""
                    SELECT *
                    FROM admin
                    WHERE id = #{id}
            """)

    Admin findById(Long id);
    @Select(
            """
SELECT *
FROM admin
WHERE store_id=#{storeId}
"""
    )
    Admin findByStoreId(Long storeId);
    @Update("""
UPDATE admin
SET password = #{password},
    must_change_password = #{mustChangePassword}
WHERE id = #{id}
""")
    void updatePasswordAndFlag(Admin admin);
    void updateAdminCredentials(Admin admin);
    void deleteById(Long id);
    void insertAdmin(Admin admin);
    List<TempResponse>selectTempAdminList();
    int countActiveAdmin();
    int countTempAdmin();
    Map<String,Object> countAdminSummary();
}