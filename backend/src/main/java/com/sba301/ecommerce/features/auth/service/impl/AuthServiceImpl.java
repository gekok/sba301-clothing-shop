package com.sba301.ecommerce.features.auth.service.impl;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.exception.InternalServerException;
import com.sba301.ecommerce.features.auth.dto.LoginResponse;
import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.auth.dto.VerificationEmailRequest;
import com.sba301.ecommerce.features.auth.repositories.EmailVerificationRepository;
import com.sba301.ecommerce.features.auth.repositories.UserRefreshTokenRepository;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.auth.service.AuthService;
import com.sba301.ecommerce.features.auth.service.UserMapper;
import com.sba301.ecommerce.features.auth.utils.Otp;
import com.sba301.ecommerce.features.entities.EmailVerification;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.UserRefreshToken;
import com.sba301.ecommerce.features.entities.enums.EmailVerificationType;
import com.sba301.ecommerce.security.jwt.JwtService;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

// TODO: implements AuthService. @RequiredArgsConstructor deps: UserRepository, PasswordEncoder, JwtService, AuthenticationManager.
//   register: existsByEmail -> EmailAlreadyExistsException; encode password; role=CUSTOMER; save; trả token.
//   login: authenticationManager.authenticate(...) (catch BadCredentials -> InvalidCredentialsException); trả token.
@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRefreshTokenRepository userRefreshTokenRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository,
                           EmailVerificationRepository emailVerificationRepository,
                           UserRefreshTokenRepository userRefreshTokenRepository,
                           EmailService emailService,
                           JwtService jwtService,
                           PasswordEncoder passwordEncoder,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.userRefreshTokenRepository = userRefreshTokenRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public void register(RegisterRequest registerRequest) {
        if(userRepository.existsUserByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address already in use");
        }
        User user = userMapper.toEntity(registerRequest);
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        userRepository.save(user);

        String otp = new Otp().generateOtp();
        EmailVerification emailVerification = new EmailVerification();
        emailVerification.setUser(user);
        emailVerification.setOtp(passwordEncoder.encode(otp));
        emailVerification.setType(EmailVerificationType.REGISTERED);
        emailVerification.setExpiredAt(Instant.from(LocalDateTime.now().plusMinutes(5)));
        emailVerificationRepository.save(emailVerification);

        try {
            emailService.send(
                    user.getEmail(),
                    "Email Verification",
                    "Your verification code is:"+otp
            );
        }catch(Exception e) {
            throw new InternalServerException("Errors server:can not send verification email");
        }
    }

    @Override
    @Transactional
    public void verifyEmail(VerificationEmailRequest verificationEmailRequest) {
        User user = userRepository
                .findUserByEmail(verificationEmailRequest.getEmail())
                .orElseThrow(()-> new BadRequestException("User not found"));

        EmailVerification emailVerification = emailVerificationRepository
                .findEmailVerificationByUserAndType(user,verificationEmailRequest.getType())
                .orElseThrow(()->new BadRequestException("EmailVerification not found"));

        if(emailVerification.getIsVerified()){
            throw new BadRequestException("Email already verified");
        }

        if(emailVerification.getExpiredAt().isAfter(Instant.now())) {
            throw new BadRequestException("Email expired");
        }

        boolean matched = passwordEncoder.matches(verificationEmailRequest.getOtp(), emailVerification.getOtp());
        if(!matched){
            throw new BadRequestException("OTP verification code is invalid");
        }

        emailVerification.setIsVerified(true);
        emailVerification.setVerifiedAt(Instant.now());

        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());

        userRepository.save(user);
        emailVerificationRepository.save(emailVerification);
    }

    @Override
    @Transactional
    public void saveRefreshToken(
            String email,
            String refreshToken,
            String userAgent,
            String address
    ) {
        User user = userRepository.findUserByEmail(email).orElseThrow(()-> new BadRequestException("User not found"));
        Claims claims = jwtService.getAllClaims(refreshToken);
        UserRefreshToken token = new UserRefreshToken();
        token.setUser(user);
        token.setRefreshToken(refreshToken);
        token.setExpiresAt(claims.getExpiration().toInstant());
        token.setRevokedAt(claims.getIssuedAt().toInstant());
        token.setUserAgent(userAgent);
        token.setIpAddress(address);
        userRefreshTokenRepository.save(token);
    }

    @Override
    @Transactional
    public LoginResponse refresh(String refreshToken, HttpServletRequest request, HttpServletResponse response) {
        if(!jwtService.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Refresh token is invalid");
        }

        UserRefreshToken storedToken = userRefreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(()-> new BadCredentialsException("Refresh token not found"));

        String email = jwtService.getEmailFromToken(refreshToken);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(()-> new BadCredentialsException("User not found"));

        if (storedToken.getRevokedAt() != null){
            throw new BadCredentialsException("Refresh token revoked");
        }

        if(storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token expired");
        }

        storedToken.setRevokedAt(Instant.now());
        userRefreshTokenRepository.save(storedToken);

        String newAccessToken = jwtService.generateJwtToken(new CustomUserDetails(user));
        String newRefreshToken = jwtService.generateRefreshToken(new CustomUserDetails(user));

        UserRefreshToken token = UserRefreshToken.builder()
                .user(user)
                .refreshToken(newRefreshToken)
                .expiresAt(
                        Instant.now().plusMillis(jwtService.refreshExpiration)
                )
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .build();
        userRefreshTokenRepository.save(token);

        return new LoginResponse(newAccessToken, newRefreshToken);
    }


}
