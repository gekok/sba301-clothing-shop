package com.sba301.ecommerce.features.auth.service;

import com.sba301.ecommerce.features.auth.dto.LoginRequest;
import com.sba301.ecommerce.features.auth.dto.LoginResponse;
import com.sba301.ecommerce.features.auth.dto.RegisterRequest;

public interface AuthService {
    LoginResponse register(RegisterRequest registerRequest);
    LoginResponse login(LoginRequest loginRequest);
}
