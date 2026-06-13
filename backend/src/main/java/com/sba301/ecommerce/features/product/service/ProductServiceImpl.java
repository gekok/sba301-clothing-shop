package com.sba301.ecommerce.features.product.service;

import org.springframework.stereotype.Service;

// TODO: implements ProductService. @RequiredArgsConstructor inject ProductRepository.
//   Map entity->ProductResponse TRONG @Transactional (fetch-join variants+images+category vi open-in-view=false).
//   Sau do refactor ProductController: bo @Autowired field + List<Map> -> constructor injection + ResponseEntity.
@Service
public class ProductServiceImpl implements ProductService {
}
