package com.sba301.ecommerce.features.product.service;

import org.springframework.stereotype.Service;

// TODO: implements ProductService. @RequiredArgsConstructor inject ProductRepository.
//   Map entity->ProductResponse TRONG @Transactional (fetch-join variants+images+category vi open-in-view=false).
//   Sau do refactor ProductController: bo @Autowired field + List<Map> -> constructor injection + ResponseEntity.
import com.sba301.ecommerce.features.category.repository.CategoryRepository;
import com.sba301.ecommerce.features.entities.Category;
import com.sba301.ecommerce.features.entities.Product;
import com.sba301.ecommerce.features.entities.enums.ProductStatus;
import com.sba301.ecommerce.features.product.dto.ProductImageResponse;
import com.sba301.ecommerce.features.product.dto.ProductRequest;
import com.sba301.ecommerce.features.product.dto.ProductResponse;
import com.sba301.ecommerce.features.product.dto.ProductVariantResponse;
import com.sba301.ecommerce.features.product.repository.ProductRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Page<ProductResponse> findAll(Integer page, Integer size) {

        Pageable pageable = PageRequest.of(page, size);

        return productRepository
                .findByDeletedAtIsNull(pageable)
                .map(this::convertResponse);

    }

    private ProductResponse convertResponse(Product product) {

        ProductResponse response = new ProductResponse();

        response.setId(product.getId());

        response.setCategoryId(
                product.getCategory().getId()
        );

        response.setCategoryName(
                product.getCategory().getName()
        );

        response.setName(product.getName());

        response.setSlug(product.getSlug());

        response.setDescription(product.getDescription());

        response.setBrand(product.getBrand());

        response.setBasePrice(product.getBasePrice());

        response.setStatus(product.getStatus().name());

        response.setCreatedAt(product.getCreatedAt());

        List<ProductImageResponse> imageResponses =
                product.getImages()
                        .stream()
                        .map(image -> {

                            ProductImageResponse dto =
                                    new ProductImageResponse();

                            dto.setId(image.getId());

                            dto.setUrl(image.getUrl());

                            dto.setIsPrimary(image.getIsPrimary());

                            return dto;
                        })
                        .toList();

        response.setImages(imageResponses);

        List<ProductVariantResponse> variantResponses =
                product.getVariants()
                        .stream()
                        .map(variant -> {

                            ProductVariantResponse dto =
                                    new ProductVariantResponse();

                            dto.setId(variant.getId());

                            dto.setSku(variant.getSku());

                            dto.setSize(variant.getSize());

                            dto.setColor(variant.getColor());

                            dto.setPrice(variant.getPrice());

                            dto.setStockQuantity(variant.getStockQuantity());

                            dto.setIsActive(variant.getIsActive());

                            return dto;
                        })
                        .toList();

        response.setVariants(variantResponses);

        return response;
    }

    @Override
    public ProductResponse findById(Long id) {

        Product product = productRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        return convertResponse(product);

    }
    @Override
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        if (productRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }

        Product product = new Product();

        product.setCategory(category);
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setBasePrice(request.getBasePrice());
        product.setStatus(request.getStatus());

        Product savedProduct =
                productRepository.save(product);

        return convertResponse(savedProduct);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {

        Product product = productRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));
        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));
        if(productRepository.existsBySlugAndIdNot(
                request.getSlug(),
                id)){

            throw new RuntimeException("Slug already exists");
        }


        product.setCategory(category);

        product.setName(request.getName());

        product.setSlug(request.getSlug());

        product.setDescription(request.getDescription());

        product.setBrand(request.getBrand());

        product.setBasePrice(request.getBasePrice());

        product.setStatus(request.getStatus());

        Product saved = productRepository.save(product);
        return convertResponse(saved);
    }
    @Override
    public void delete(Long id) {
        Product product = productRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));
        product.setDeletedAt(LocalDateTime.now());

        product.setStatus(ProductStatus.HIDDEN);

        productRepository.save(product);
    }
}
