package com.sba301.ecommerce.features.order.repository;

import com.sba301.ecommerce.features.entities.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {
    
    List<InventoryReservation> findBySessionId(String sessionId);
    
    List<InventoryReservation> findByUserId(Long userId);
    
    void deleteBySessionId(String sessionId);
    
    List<InventoryReservation> findByExpiresAtBefore(LocalDateTime time);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(ir.quantity) FROM InventoryReservation ir WHERE ir.user.id = :userId AND ir.variant.id = :variantId")
    Integer getReservedQuantityForUserAndVariant(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("variantId") Long variantId);
}
