package com.sba301.ecommerce.features.category.service;

import com.sba301.ecommerce.features.category.dto.CategoryResponse;
import com.sba301.ecommerce.features.category.repository.CategoryRepository;
import com.sba301.ecommerce.features.entities.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// TODO: implements CategoryService. @RequiredArgsConstructor inject CategoryRepository. Map entity->DTO trong @Transactional.
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> findAll() {

        return categoryRepository.findAll()
                .stream()
                .map(this::convertResponse)
                .toList();
    }

    private CategoryResponse convertResponse(Category category) {

        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());

        return response;
    }
}
