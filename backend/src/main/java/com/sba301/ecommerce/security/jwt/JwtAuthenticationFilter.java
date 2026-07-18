package com.sba301.ecommerce.security.jwt;

import org.springframework.stereotype.Component;

// TODO: extends OncePerRequestFilter (import jakarta.servlet.*).
//   doFilterInternal: đọc header "Authorization: Bearer <token>";
//   nếu jwtService.isValid -> load UserDetails -> set UsernamePasswordAuthenticationToken vào SecurityContext.
//   Token lỗi -> bỏ qua (để entry point trả 401). Deps: JwtService, CustomUserDetailsService.
@Component
public class JwtAuthenticationFilter {
}
