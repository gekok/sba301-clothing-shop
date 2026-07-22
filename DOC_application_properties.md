# GIẢI THÍCH CHI TIẾT FILE CẤU HÌNH: application.properties & MockDevelopmentAuthFilter.java

- **Đường dẫn tương đối:** 
  - `backend/src/main/resources/application.properties`
  - `backend/src/main/java/com/sba301/ecommerce/config/MockDevelopmentAuthFilter.java`

---

## 1. `application.properties`
```properties
# Kết nối cơ sở dữ liệu Microsoft SQL Server
spring.datasource.url=jdbc:sqlserver://localhost:1433; DatabaseName=sba301_ecommerce; encrypt=true; trustServerCertificate=true;
spring.datasource.username=sa
spring.datasource.password=123456
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# Hibernate DDL Auto (none: không tự động xóa hay sửa cấu trúc bảng trong CSDL)
spring.jpa.hibernate.ddl-auto=none

# Cấu hình Cổng thanh toán VNPAY Sandbox
vnpay.tmn-code=OWBZLJR8
vnpay.hash-secret=OOV71FUQL5VBFDON8N90WFPOEJK5OO0V
```

---

## 2. `MockDevelopmentAuthFilter.java`
```java
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

@Component
public class MockDevelopmentAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public MockDevelopmentAuthFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Giả lập đăng nhập bằng user customer@sba301.local
        String mockEmail = "customer@sba301.local";

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findUserByEmail(mockEmail);
            if (user != null) {
                CustomUserDetails userDetails = new CustomUserDetails(user);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // Nạp user vào SecurityContextHolder ngầm
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```
