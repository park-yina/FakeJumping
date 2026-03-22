package com.parkvina.fakejumping.mapper;

import com.parkvina.fakejumping.entity.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

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
    void insertAdmin(Admin admin);
}