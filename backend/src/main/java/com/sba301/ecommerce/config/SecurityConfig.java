package com.sba301.ecommerce.config;

import com.sba301.ecommerce.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// authorizeHttpRequests (path SAU context-path /api/v1 — controller nào tự khai "/api/..." trong
// @RequestMapping thì matcher vẫn phải ghi nguyên "/api/..." vì đó là path riêng của controller,
// không phải context-path):
//   permitAll: OPTIONS /**, /auth/**, GET sản phẩm/danh mục/review, swagger, actuator/health
//   hasRole("CUSTOMER"): /carts/**
//   hasAnyRole("ADMIN","STAFF"): ghi/sửa/xoá sản phẩm, /admin/orders/**, /pos/**
//   hasRole("ADMIN"): /audit-logs/**
//   Các endpoint chưa liệt kê (reviews POST, addresses, checkout, orders/me...) tạm giữ permitAll
//   như hiện trạng — chưa audit hết trong lần sửa nhanh này, cần PR riêng để siết tiếp.
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf((csrf -> csrf.disable())) //Tắt csrf vì web restApi ko cần
                .cors(cors ->cors.configurationSource(corsConfigurationSource())) //bật customs config cors có thể viết là Customizer.withDefaults()
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) //Vì dùng jwt nên tắt session
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests((auth)->{
                    auth
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                            .requestMatchers("/", "/auth/**").permitAll()
                            .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/actuator/health").permitAll()
                            .requestMatchers(HttpMethod.GET,
                                    "/api/admin/products/**", "/api/admin/v2/products/**",
                                    "/categories/**", "/products/*/reviews/**").permitAll()
                            .requestMatchers("/carts/**").hasRole("CUSTOMER")
                            .requestMatchers(HttpMethod.POST, "/api/admin/products", "/api/admin/v2/products",
                                    "/api/admin/v2/products/upload-image").hasAnyRole("ADMIN", "STAFF")
                            .requestMatchers(HttpMethod.PUT, "/api/admin/products/**", "/api/admin/v2/products/**")
                                    .hasAnyRole("ADMIN", "STAFF")
                            .requestMatchers(HttpMethod.DELETE, "/api/admin/products/**").hasAnyRole("ADMIN", "STAFF")
                            .requestMatchers("/admin/orders/**").hasAnyRole("ADMIN", "STAFF")
                            .requestMatchers("/pos/**").hasAnyRole("ADMIN", "STAFF")
                            .requestMatchers("/audit-logs/**").hasRole("ADMIN")
                            .anyRequest().permitAll(); //các endpoint còn lại giữ nguyên hiện trạng, chưa siết trong lần sửa nhanh này
                });

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowCredentials(true);//cho phép mọi request dính kèm cookie
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
