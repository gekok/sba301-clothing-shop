package com.sba301.ecommerce.features.review.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sba301.ecommerce.features.entities.Review;
import com.sba301.ecommerce.features.review.dto.ReviewResponse;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "authorName", source = "user.fullName")
    @Mapping(target = "orderItemId", source = "orderItem.id")
    ReviewResponse toResponse(Review review);
}
