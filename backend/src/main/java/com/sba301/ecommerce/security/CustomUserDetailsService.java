package com.sba301.ecommerce.security;

import org.springframework.stereotype.Service;

// TODO: implements UserDetailsService.
//   loadUserByUsername(email) -> UserRepository.findByEmail(email)
//                                  .orElseThrow(() -> new UsernameNotFoundException(...)) -> new CustomUserDetails(user)
@Service
public class CustomUserDetailsService {
}
