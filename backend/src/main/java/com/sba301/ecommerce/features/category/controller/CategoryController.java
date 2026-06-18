package com.sba301.ecommerce.features.category.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: @RequiredArgsConstructor inject CategoryService.
//   GET /categories (list/tree), GET /categories/{id}  (permitAll)
//   POST/PUT/DELETE  (hasAnyRole ADMIN,STAFF)
@RestController
@RequestMapping("/categories")
public class CategoryController {
}
