package com.parkvina.fakejumping.mapper;

import com.parkvina.fakejumping.dto.PendingStoreInfo;
import com.parkvina.fakejumping.dto.PendingStoreSummary;
import com.parkvina.fakejumping.dto.RegionSummary;
import com.parkvina.fakejumping.entity.Admin;
import com.parkvina.fakejumping.entity.Store;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
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
    @Select(
            """
SELECT *
FROM store
where address=#{address}
"""
    )
    Store findByAddress(@Param("address") String address);
    @Select("""
SELECT DISTINCT region
FROM store
ORDER BY region
""")
    List<String> findRegions();
    @Select("""
SELECT DISTINCT city
FROM store
WHERE region = #{region}
AND city IS NOT NULL
ORDER BY city
""")
    List<String> findCitiesByRegion(String region);
    @Select("""

            SELECT COUNT(*)
       FROM store
       WHERE is_active = 1
         AND open_at IS NULL;""")
    int countFutureOpenStores();
    List<String> findDistricts(@Param("region") String region,
                               @Param("city") String city);
    void insertStore(Store store);
    List<Store> selectActiveStore();
    Map<String,Object> countStoreSummary();
    List<Store>findStores(
            @Param("region")String region,
            @Param("city") String city,
            @Param("district")String district
    );
    List<RegionSummary>regionSummary();
    List<PendingStoreInfo>findPendingStoreInfo(@Param("limit")Integer limit);

}
