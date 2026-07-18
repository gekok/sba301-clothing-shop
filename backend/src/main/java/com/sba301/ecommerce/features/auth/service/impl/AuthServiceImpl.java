package com.sba301.ecommerce.features.auth.service.impl;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.features.auth.dto.RegisterRequest;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.auth.service.AuthService;
import com.sba301.ecommerce.features.auth.service.UserMapper;
import com.sba301.ecommerce.features.entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// TODO: implements AuthService. @RequiredArgsConstructor deps: UserRepository, PasswordEncoder, JwtService, AuthenticationManager.
//   register: existsByEmail -> EmailAlreadyExistsException; encode password; role=CUSTOMER; save; trả token.
//   login: authenticationManager.authenticate(...) (catch BadCredentials -> InvalidCredentialsException); trả token.
@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
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



    }
}
