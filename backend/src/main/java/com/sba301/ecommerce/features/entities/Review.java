package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(name = "uk_reviews_user_order_item",
                columnNames = {"user_id", "order_item_id"}),
        indexes = @Index(name = "ix_reviews_product", columnList = "product_id"))
@Getter
@Setter
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_reviews_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_reviews_product"))
    private Product product;

    // Links to the actual purchase — guarantees user can only review what they bought
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_reviews_order_item"))
    private OrderItem orderItem;

    // 1..5 — CHECK constraint đã đặt trong docs/db.sql
    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Ẩn/hiện do admin/staff toggle — review bị ẩn không xoá khỏi DB, chỉ loại khỏi API công khai.
    @ColumnDefault("1")
    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    // Hibernate tự fill khi INSERT lẫn UPDATE (xem docs/db.sql migration để biết cách backfill dữ liệu cũ).
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
