package com.sba301.ecommerce.features.product.dto;

// TODO: id, name, slug, brand, basePrice, status, categoryName,
//   List<ProductVariantResponse> variants, List<ProductImageResponse> images.  (phang, KHONG tra entity)
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductResponse {
    private Long id;

    private Long categoryId;

    private String categoryName;

    private String name;

    private String slug;

    private String description;

    private String brand;

    private BigDecimal basePrice;

    private String status;

    private LocalDateTime createdAt;

    private List<ProductImageResponse> images;

    private List<ProductVariantResponse> variants;
}
