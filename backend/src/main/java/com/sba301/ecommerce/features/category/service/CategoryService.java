package com.sba301.ecommerce.features.category.service;

// TODO: List<CategoryResponse> findAllTree(); CategoryResponse findById(Long); Long create(CategoryRequest);
//   CategoryResponse update(Long, CategoryRequest); void delete(Long).
import com.sba301.ecommerce.features.category.dto.CategoryResponse;

import java.util.List;
public interface CategoryService {
    List<CategoryResponse> findAll();
}
