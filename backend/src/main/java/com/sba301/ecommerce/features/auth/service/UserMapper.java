package com.sba301.ecommerce.features.auth.service;

import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @org.mapstruct.Mapping(target = "passwordHash", source = "password")
    @org.mapstruct.Mapping(target = "status", constant = "ACTIVE")
    User toEntity(RegisterRequest registerRequest);
}
