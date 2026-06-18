package com.sba301.ecommerce.security;

// TODO: implements org.springframework.security.core.userdetails.UserDetails — bọc User entity.
//   getUsername()=email, getPassword()=passwordHash,
//   getAuthorities()=List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole().name())),
//   isEnabled()=user.getIsActive(); expose getUser() để lấy id không cần query lại.
public class CustomUserDetails {
}
