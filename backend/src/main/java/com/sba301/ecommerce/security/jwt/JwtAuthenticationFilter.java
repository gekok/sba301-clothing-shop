package com.sba301.ecommerce.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// TODO: extends OncePerRequestFilter (import jakarta.servlet.*).
//   doFilterInternal: đọc header "Authorization: Bearer <token>";
//   nếu jwtService.isValid -> load UserDetails -> set UsernamePasswordAuthenticationToken vào SecurityContext.
//   Token lỗi -> bỏ qua (để entry point trả 401). Deps: JwtService, CustomUserDetailsService.
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring("Bearer ".length());
        }
        filterChain.doFilter(request, response);
    }
}
