package com.sba301.ecommerce.features.category.repository;

import com.sba301.ecommerce.features.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// TODO: List<Category> findByParentIsNull() (root); Category findBySlug(String).
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
