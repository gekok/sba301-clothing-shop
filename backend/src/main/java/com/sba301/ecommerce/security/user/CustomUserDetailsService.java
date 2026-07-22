package com.sba301.ecommerce.security.user;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// TODO: implements UserDetailsService.
//   loadUserByUsername(email) -> UserRepository.findByEmail(email)
//                                  .orElseThrow(() -> new UsernameNotFoundException(...)) -> new CustomUserDetails(user)
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository
                .findUserByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email or password is incorrect"));

        return new CustomUserDetails(user);
    }
}
