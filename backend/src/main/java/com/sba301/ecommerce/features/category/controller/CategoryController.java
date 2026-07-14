package com.sba301.ecommerce.features.category.controller;

import com.sba301.ecommerce.features.category.dto.CategoryResponse;
import com.sba301.ecommerce.features.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// TODO: @RequiredArgsConstructor inject CategoryService.
//   GET /categories (list/tree), GET /categories/{id}  (permitAll)
//   POST/PUT/DELETE  (hasAnyRole ADMIN,STAFF)
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor

public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> findAll() {

        return ResponseEntity.ok(
                categoryService.findAll()
        );
    }
}
