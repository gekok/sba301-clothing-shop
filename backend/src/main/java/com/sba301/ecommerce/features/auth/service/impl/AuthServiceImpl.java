package com.sba301.ecommerce.features.auth.service.impl;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.exception.InternalServerException;
import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.auth.dto.VerificationEmailRequest;
import com.sba301.ecommerce.features.auth.repositories.EmailVerificationRepository;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.auth.service.AuthService;
import com.sba301.ecommerce.features.auth.service.UserMapper;
import com.sba301.ecommerce.features.auth.utils.Otp;
import com.sba301.ecommerce.features.entities.EmailVerification;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.EmailVerificationType;
import com.sba301.ecommerce.features.entities.enums.UserStatus;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository,
                           EmailVerificationRepository emailVerificationRepository,
                           EmailService emailService,
                           PasswordEncoder passwordEncoder,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.emailService = emailService;
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


}
