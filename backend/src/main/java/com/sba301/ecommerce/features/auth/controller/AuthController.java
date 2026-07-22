package com.sba301.ecommerce.features.auth.controller;

import com.sba301.ecommerce.features.auth.dto.*;
import com.sba301.ecommerce.features.auth.service.AuthService;
import com.sba301.ecommerce.security.jwt.JwtService;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
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
    private final JwtService jwtService;

    @Autowired
    public AuthController(AuthService authService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/verification")
    public ResponseEntity<?> verification(@RequestBody VerificationEmailRequest verificationEmailRequest) {
        authService.verifyEmail(verificationEmailRequest);
        return ResponseEntity.ok(Map.of("message", "Verification success!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   HttpServletRequest httpRequest,
                                   HttpServletResponse response) {

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String accessToken = jwtService.generateJwtToken((CustomUserDetails) authentication.getPrincipal());
            String refreshToken = jwtService.generateRefreshToken((CustomUserDetails) authentication.getPrincipal());
            authService.saveRefreshToken(
                    loginRequest.getEmail(),
                    refreshToken,
                    httpRequest.getHeader("User-Agent"),
                    httpRequest.getRemoteAddr()
            );
            ResponseCookie cookie = ResponseCookie.from(
                            "refreshToken",
                            refreshToken)
                    .httpOnly(true)
                    .secure(true)       // HTTPS
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(Duration.ofDays(30))
                    .build();

            response.addHeader(
                    HttpHeaders.SET_COOKIE,
                    cookie.toString()
            );
            return ResponseEntity.ok(new LoginResponse(accessToken, null));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refresh(@CookieValue String refreshToken,
                                     HttpServletResponse response,
                                     HttpServletRequest request) {
        LoginResponse loginResponse = authService.refresh(refreshToken, request, response);

        ResponseCookie cookie = ResponseCookie.from(
                        "refreshToken",
                        loginResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)       // HTTPS
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );
        return ResponseEntity.ok(new LoginResponse(loginResponse.getAccessToken(),null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request){
        System.out.println(request.getEmail());
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Password forgot success!"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> VerifyOtpForgotPassword(@Valid @RequestBody VerificationEmailRequest verificationEmailRequest){
        String token = authService.VerifyOtpForgotPassword(verificationEmailRequest.getEmail(),verificationEmailRequest.getOtp());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request){
        authService.resetPassword(request.getToken(),request.getPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset success!"));
    }


}
