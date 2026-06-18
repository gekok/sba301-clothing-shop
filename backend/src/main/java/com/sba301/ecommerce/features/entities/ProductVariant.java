package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_variants_sku", columnNames = "sku"),
                @UniqueConstraint(name = "uk_variants_product_size_color",
                        columnNames = {"product_id", "size", "color"})
        })
@Getter
@Setter
@NoArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_variants_product"))
    private Product product;

    @Column(nullable = false, length = 64)
    private String sku;

    @Column(nullable = false, length = 20)
    private String size;

    @Column(nullable = false, length = 50)
    private String color;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Optimistic locking — protects against double-spend on stock during concurrent checkout
    @Version
    @Column(nullable = false)
    private Long version = 0L;
}
