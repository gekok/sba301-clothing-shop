package com.sba301.ecommerce.features.review.mapper;

import com.sba301.ecommerce.features.entities.Review;
import com.sba301.ecommerce.features.review.dto.ReviewResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "authorName", source = "user.fullName")
    @Mapping(target = "orderItemId", source = "orderItem.id")
    ReviewResponse toResponse(Review review);
}