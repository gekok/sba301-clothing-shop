package com.sba301.ecommerce.features.product.service;

import com.sba301.ecommerce.features.entities.Product;
import com.sba301.ecommerce.features.entities.ProductVariant;
import com.sba301.ecommerce.features.product.dto.ProductVariantRequest;
import com.sba301.ecommerce.features.product.dto.ProductVariantResponse;
import com.sba301.ecommerce.features.product.repository.ProductRepository;
import com.sba301.ecommerce.features.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    private ProductVariantResponse convertToResponse(ProductVariant variant) {
        ProductVariantResponse response = new ProductVariantResponse();
        response.setId(variant.getId());
        response.setSku(variant.getSku());
        response.setSize(variant.getSize());
        response.setColor(variant.getColor());
        response.setPrice(variant.getPrice());
        response.setStockQuantity(variant.getStockQuantity());
        response.setIsActive(variant.getIsActive());
        return response;
    }

    @Override
    @Transactional
    public ProductVariantResponse create(Long productId, ProductVariantRequest request) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (productVariantRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku(request.getSku());
        variant.setSize(request.getSize());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());
        variant.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return convertToResponse(savedVariant);
    }

    @Override
    @Transactional
    public ProductVariantResponse update(Long variantId, ProductVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        if (productVariantRepository.existsBySkuAndIdNot(request.getSku(), variantId)) {
            throw new RuntimeException("SKU already exists");
        }

        variant.setSku(request.getSku());
        variant.setSize(request.getSize());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());
        variant.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return convertToResponse(updatedVariant);
    }

    @Override
    @Transactional
    public void delete(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        // We do a hard delete to match expectations (if not referenced in orders)
        // Spring Data JPA throws DataIntegrityViolationException if referenced in OrderItems
        productVariantRepository.delete(variant);
    }
}
