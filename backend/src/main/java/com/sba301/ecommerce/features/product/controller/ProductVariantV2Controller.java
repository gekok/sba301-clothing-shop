package com.sba301.ecommerce.features.product.controller;

import com.sba301.ecommerce.features.product.dto.ProductVariantRequest;
import com.sba301.ecommerce.features.product.dto.ProductVariantResponse;
import com.sba301.ecommerce.features.product.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/v2/products")
@RequiredArgsConstructor
public class ProductVariantV2Controller {

    private final ProductVariantService productVariantService;

    @PostMapping("/{productId}/variants")
    public ResponseEntity<ProductVariantResponse> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(productVariantService.create(productId, request));
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(productVariantService.update(variantId, request));
    }

    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long variantId) {
        productVariantService.delete(variantId);
        return ResponseEntity.ok().build();
    }
}
