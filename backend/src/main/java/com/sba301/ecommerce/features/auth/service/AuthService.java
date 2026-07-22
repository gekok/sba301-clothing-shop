package com.sba301.ecommerce.features.auth.service;

import com.sba301.ecommerce.features.auth.dto.LoginResponse;
import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.auth.dto.VerificationEmailRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// TODO: AuthResponse register(RegisterRequest req); AuthResponse login(LoginRequest req);
public interface AuthService {
    public void register(RegisterRequest registerRequest);
    public void verifyEmail(VerificationEmailRequest verificationEmailRequest);
    public void saveRefreshToken(
            String email,
            String refreshToken,
            String userAgent,
            String address
    );
    public LoginResponse refresh(
            String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response
    );
    public void forgotPassword(String email);
    public String VerifyOtpForgotPassword(String email,String otp);
    public void resetPassword(String token,String newPassword);
}
