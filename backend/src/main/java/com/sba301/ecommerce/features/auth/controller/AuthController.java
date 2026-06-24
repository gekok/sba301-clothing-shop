package com.sba301.ecommerce.features.auth.controller;

import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// TODO: @RequiredArgsConstructor inject AuthService.
//   POST /auth/login    @Valid @RequestBody LoginRequest    -> ResponseEntity<AuthResponse> (200)
//   POST /auth/register @Valid @RequestBody RegisterRequest -> ResponseEntity<AuthResponse> (201)
// Resolve -> /api/auth/...  (khớp FE baseURL http://localhost:8080/api)
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(AuthService authService,
                          PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }
}
