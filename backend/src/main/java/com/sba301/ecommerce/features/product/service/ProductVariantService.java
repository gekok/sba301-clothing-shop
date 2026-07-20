package com.sba301.ecommerce.features.product.service;

import com.sba301.ecommerce.features.product.dto.ProductVariantRequest;
import com.sba301.ecommerce.features.product.dto.ProductVariantResponse;

public interface ProductVariantService {
    ProductVariantResponse create(Long productId, ProductVariantRequest request);
    ProductVariantResponse update(Long variantId, ProductVariantRequest request);
    void delete(Long variantId);
}
