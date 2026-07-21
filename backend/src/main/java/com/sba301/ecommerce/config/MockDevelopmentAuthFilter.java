package com.sba301.ecommerce.config;

import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter dùng TẠM THỜI cho môi trường dev để tự động giả mạo (mock) Đăng nhập.
 * Sau khi team Auth làm xong JWT Filter thì có thể xóa file này.
 */
@Component
public class MockDevelopmentAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public MockDevelopmentAuthFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Giả vờ đăng nhập bằng tài khoản "customer@sba301.local" (tài khoản do
        // DatabaseSeeder tạo)
        String mockEmail = "customer@sba301.local";

        // Hoặc bạn có thể đổi thành admin@sba301.local nếu cần test quyền Admin
        // String mockEmail = "admin@sba301.local";

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findUserByEmail(mockEmail);
            if (user != null) {
                CustomUserDetails userDetails = new CustomUserDetails(user);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}

// localStorage.setItem('accessToken', 'mock-token-cho-vui');
// localStorage.setItem('role', 'CUSTOMER');
