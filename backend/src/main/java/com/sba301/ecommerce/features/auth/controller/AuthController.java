package com.sba301.ecommerce.features.auth.controller;

import com.sba301.ecommerce.features.auth.dto.LoginRequest;
import com.sba301.ecommerce.features.auth.dto.LoginResponse;
import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.auth.dto.VerificationEmailRequest;
import com.sba301.ecommerce.features.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// TODO: @RequiredArgsConstructor inject AuthService.
//   POST /auth/login    @Valid @RequestBody LoginRequest    -> ResponseEntity<AuthResponse> (200)
//   POST /auth/register @Valid @RequestBody RegisterRequest -> ResponseEntity<AuthResponse> (201)
// Resolve -> /api/auth/...  (khớp FE baseURL http://localhost:8080/api)
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(AuthService authService,
                          AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @GetMapping("/verification")
    public ResponseEntity<?> verification(@RequestBody VerificationEmailRequest verificationEmailRequest) {
        authService.verifyEmail(verificationEmailRequest);
        return ResponseEntity.ok(Map.of("message", "Verification success!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return ResponseEntity.ok(new LoginResponse());
        }catch (BadCredentialsException e) {
            throw new BadCredentialsException("Email or password is incorrect");
        }
    }


}
