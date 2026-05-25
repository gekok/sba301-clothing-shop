package com.sba301.ecommerce.entity;

import com.sba301.ecommerce.entity.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products",
        uniqueConstraints = @UniqueConstraint(name = "uk_products_slug", columnNames = "slug"),
        indexes = {
                @Index(name = "ix_products_category", columnList = "category_id"),
                @Index(name = "ix_products_status", columnList = "status")
        })
@Getter
@Setter
@NoArgsConstructor
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_products_category"))
    private Category category;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 280)
    private String slug;

    @Lob
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(length = 100)
    private String brand;

    @Column(name = "base_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal basePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.DRAFT;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();
}
