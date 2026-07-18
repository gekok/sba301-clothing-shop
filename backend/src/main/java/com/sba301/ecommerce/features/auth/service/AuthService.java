package com.sba301.ecommerce.features.auth.service;

import com.sba301.ecommerce.features.auth.dto.RegisterRequest;

// TODO: AuthResponse register(RegisterRequest req); AuthResponse login(LoginRequest req);
public interface AuthService {
    public void register(RegisterRequest registerRequest);
}
