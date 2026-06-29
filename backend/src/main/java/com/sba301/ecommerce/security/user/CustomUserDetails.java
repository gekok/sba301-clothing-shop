package com.sba301.ecommerce.security.user;

// TODO: implements org.springframework.security.core.userdetails.UserDetails — bọc User entity.
//   getUsername()=email, getPassword()=passwordHash,
//   getAuthorities()=List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole().name())),
//   isEnabled()=user.getIsActive(); expose getUser() để lấy id không cần query lại.
import com.sba301.ecommerce.features.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final User user;

    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isEnabled() {
        return "ACTIVE".equals(user.getStatus());
    }
}
