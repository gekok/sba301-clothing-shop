package com.sba301.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    // 1..5 — also enforce a CHECK constraint at DB level via schema migration
    @Column(nullable = false)
    private Short rating;

    @Column(length = 1000)
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
