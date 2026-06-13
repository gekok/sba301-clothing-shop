package com.sba301.ecommerce.features.auth.service;

import org.springframework.stereotype.Service;

// TODO: implements AuthService. @RequiredArgsConstructor deps: UserRepository, PasswordEncoder, JwtService, AuthenticationManager.
//   register: existsByEmail -> EmailAlreadyExistsException; encode password; role=CUSTOMER; save; trả token.
//   login: authenticationManager.authenticate(...) (catch BadCredentials -> InvalidCredentialsException); trả token.
@Service
public class AuthServiceImpl implements AuthService {
}
