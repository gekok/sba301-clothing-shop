package com.sba301.ecommerce.security;

import org.springframework.context.annotation.Configuration;

// TODO: thêm @EnableWebSecurity @RequiredArgsConstructor (inject JwtAuthenticationFilter).
//   Beans: PasswordEncoder(BCrypt), AuthenticationManager(từ AuthenticationConfiguration), CorsConfigurationSource(origin http://localhost:5173).
//   SecurityFilterChain: cors() + csrf(disable) + sessionManagement(STATELESS)
//     + addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
//   authorizeHttpRequests (path SAU context-path /api — KHÔNG thêm /api):
//     permitAll: OPTIONS /**, /auth/**, GET /products/**, GET /categories/**, /swagger-ui/**, /swagger-ui.html, /v3/api-docs/**, /actuator/health
//     hasRole("CUSTOMER"): /carts/**
//     hasAnyRole("ADMIN","STAFF"): POST/PUT/DELETE products+categories, PUT /orders/*/status
//     anyRequest().authenticated()
@Configuration
public class SecurityConfig {
}
