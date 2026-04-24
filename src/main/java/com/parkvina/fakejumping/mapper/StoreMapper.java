package com.parkvina.fakejumping.mapper;

import com.parkvina.fakejumping.dto.store.MyStoreSummary;
import com.parkvina.fakejumping.dto.store.PendingStoreInfo;
import com.parkvina.fakejumping.dto.RegionSummary;
import com.parkvina.fakejumping.entity.Store;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
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
    SELECT DISTINCT
        CASE
            WHEN city IS NULL OR city = '' THEN district
            ELSE city
        END
    FROM store
    WHERE region = #{region}
    ORDER BY 1
""")
    List<String> findSubRegions(String region);

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

    Map<String, Object> countStoreSummary();
    String findSubRegions();
    List<Store> findStoresPaged(
            @Param("region") String region,
            @Param("subRegion") String subRegion,
            @Param("status") String status,
            @Param("size") int size,
            @Param("offset") int offset
    );


    int countStores(
            @Param("region") String region,
            @Param("subRegion") String subRegion,
            @Param("status") String status
    );
    @Select("""
SELECT *
FROM store
WHERE is_active = 1
  AND open_at IS NOT NULL
  AND open_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
  AND open_at < DATE_FORMAT(NOW() + INTERVAL 1 MONTH, '%Y-%m-01')
  AND open_at <= NOW()
""")
    List<Store> findThisMonthOpen();
    @Select("""
SELECT *
FROM store
WHERE is_active = 1
  AND open_at IS NOT NULL
  AND open_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
  AND open_at < DATE_FORMAT(NOW() + INTERVAL 1 MONTH, '%Y-%m-01')
  AND open_at > NOW()
""")
    List<Store> findThisMonthUpcoming();
    List<RegionSummary> regionSummary();

    List<PendingStoreInfo> findPendingStoreInfo(@Param("limit") Integer limit);

    void updateOpenAt(
            @Param("id") Long id,
            @Param("openAt") LocalDateTime openAt
    );
    void updateClosedAt(
            @Param("id") Long id,
            @Param("openAt") LocalDateTime closedAt
    );
    MyStoreSummary findMyStoreSummary(@Param("storeId") Long storeId);
}
