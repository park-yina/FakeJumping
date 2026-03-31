package com.parkvina.fakejumping.mapper;

import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface StoreMapper {
    @Select(
            """
            SELECT *
            FROM store
            WHERE id=#{id}
            """
    )
    Store findById(Long id);
    @Select("""
SELECT  *
FROM store
WHERE name=#{name}

""")
    Store findByName(String name);
    void insertStore(Store store);
    List<Store> selectActiveStore();
    Map<String,Object> countStoreSummary();

}
