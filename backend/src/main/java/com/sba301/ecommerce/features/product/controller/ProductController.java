package com.sba301.ecommerce.features.product.controller;

import com.sba301.ecommerce.features.entities.enums.ProductStatus;
import com.sba301.ecommerce.features.product.dto.ProductRequest;
import com.sba301.ecommerce.features.product.dto.ProductResponse;
import com.sba301.ecommerce.features.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> findAll(

            @RequestParam(defaultValue = "0")
            Integer page,

            @RequestParam(defaultValue = "10")
            Integer size,

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            ProductStatus status,

            @RequestParam(defaultValue = "id")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction

    ) {

        return ResponseEntity.ok(
                productService.findAll(page, size, keyword,
                        categoryId,
                        status,
                        sortBy,
                        direction)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(
            @PathVariable Long id){

        return ResponseEntity.ok(
                productService.findById(id)
        );
    }
    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(
                productService.create(request)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.ok(
                productService.update(id, request)
        );
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id){

        productService.delete(id);

        return ResponseEntity.noContent().build();
    }
}