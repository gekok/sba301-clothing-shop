package com.sba301.ecommerce.security.user;

import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.UserStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

// TODO: implements org.springframework.security.core.userdetails.UserDetails — bọc User entity.
//   getUsername()=email, getPassword()=passwordHash,
//   getAuthorities()=List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole().name())),
//   isEnabled()=user.getIsActive(); expose getUser() để lấy id không cần query lại.
@Getter
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {
    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority(
                        user.getRole().name()
                )
        );
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    public Long getId(){
        return user.getId();
    }

    public UserStatus getStatus(){
        return user.getStatus();
    }

    public String getEmail(){
        return user.getEmail();
    }
}
