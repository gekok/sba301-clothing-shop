package com.sba301.ecommerce.features.auth.service;

import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "passwordHash", source = "password")
    User toEntity(RegisterRequest registerRequest);
}
