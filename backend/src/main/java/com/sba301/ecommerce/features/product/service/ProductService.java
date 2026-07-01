package com.sba301.ecommerce.features.product.service;

// TODO: Page<ProductResponse> findAll(Pageable); ProductResponse findById(Long); ProductResponse findBySlug(String);
//   Long create(ProductRequest); ProductResponse update(Long, ProductRequest); void delete(Long) (xoa mem: deletedAt/status).
//   LUU Y: paging 0-based (dung lap bug repo mau default index=1).
import com.sba301.ecommerce.features.entities.Product;
import com.sba301.ecommerce.features.product.dto.ProductRequest;
import com.sba301.ecommerce.features.product.dto.ProductResponse;
import org.springframework.data.domain.Page;

public interface ProductService {
    Page<ProductResponse> findAll(
            Integer page,
            Integer size
    );

    ProductResponse findById(Long id);
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);
}

