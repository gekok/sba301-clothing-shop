package com.sba301.ecommerce.config;

import com.sba301.ecommerce.security.jwt.JwtAuthenticationFilter;
import com.sba301.ecommerce.security.user.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

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
@EnableMethodSecurity
public class SecurityConfig {
    private final CustomUserDetailsService customUserDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    public SecurityConfig(CustomUserDetailsService customUserDetailsService,
                          PasswordEncoder passwordEncoder,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.customUserDetailsService = customUserDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf((AbstractHttpConfigurer::disable)) //Tắt csrf vì web restApi ko cần
                .cors(cors ->cors.configurationSource(corsConfigurationSource())) //bật customs config cors có thể viết là Customizer.withDefaults()
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) //Vì dùng jwt nên tắt session
                .authorizeHttpRequests((auth)->{
                    auth
                            .requestMatchers("/","/api/auth/**").permitAll()
                            .anyRequest().permitAll(); //đang mở tất cả Api ko cần check
                })
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowCredentials(true);//cho phép mọi request dính kèm cookie
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager()  {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(customUserDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(daoAuthenticationProvider);
    }
}
