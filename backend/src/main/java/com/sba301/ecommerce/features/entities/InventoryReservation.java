package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_reservations",
        indexes = {
                @Index(name = "ix_inventory_res_session", columnList = "session_id"),
                @Index(name = "ix_inventory_res_user", columnList = "user_id"),
                @Index(name = "ix_inventory_res_expires", columnList = "expires_at")
        })
@Getter
@Setter
@NoArgsConstructor
public class InventoryReservation extends BaseEntity {

    @Column(name = "session_id", nullable = false, length = 100)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inv_res_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inv_res_variant"))
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
