package com.sba301.ecommerce.features.category.dto;

import lombok.Getter;
import lombok.Setter;

// TODO: id, name, slug, displayOrder, isActive, parentId, List<CategoryResponse> children (1 cap tranh de quy sau).
@Getter
@Setter
public class CategoryResponse {
    
    private Long id;

    private String name;

    private String slug;
}
