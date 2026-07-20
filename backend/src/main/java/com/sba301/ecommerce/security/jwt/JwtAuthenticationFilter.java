package com.sba301.ecommerce.security.jwt;

import com.sba301.ecommerce.security.user.CustomUserDetails;
import com.sba301.ecommerce.security.user.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// TODO: extends OncePerRequestFilter (import jakarta.servlet.*).
//   doFilterInternal: đọc header "Authorization: Bearer <token>";
//   nếu jwtService.isValid -> load UserDetails -> set UsernamePasswordAuthenticationToken vào SecurityContext.
//   Token lỗi -> bỏ qua (để entry point trả 401). Deps: JwtService, CustomUserDetailsService.
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final  JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService,
                                   CustomUserDetailsService customUserDetailsService) {
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring("Bearer ".length());
            try {
                String email = jwtService.getEmailFromToken(token);
                if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    CustomUserDetails userDetails =(CustomUserDetails) customUserDetailsService.loadUserByUsername(email);
                    if(jwtService.validateJwtToken(token,userDetails)){
                        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    }
                }
            }catch (ExpiredJwtException e){
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
