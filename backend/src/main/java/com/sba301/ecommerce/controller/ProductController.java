package com.sba301.ecommerce.controller;

import com.sba301.ecommerce.entity.Product;
import com.sba301.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")

public class ProductController {
    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    @GetMapping
    public List<Map<String, Object>> getAllProducts(){
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Product product : products) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", product.getId());
            dto.put("name", product.getName());
            dto.put("brand", product.getBrand());
            dto.put("basePrice", product.getBasePrice());
            dto.put("slug", product.getSlug());
            dto.put("description", product.getDescription());
            dto.put("status", product.getStatus() != null ? product.getStatus().name() : "DRAFT");
            result.add(dto);
        }

        return result;
    }
}
