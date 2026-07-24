package com.sba301.ecommerce.features.auth.controller;

import com.sba301.ecommerce.features.auth.dto.UserResponse;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: GET /users/me -> profile user hiện tại (lấy từ SecurityContext -> CustomUserDetails).
@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> getUser() {
        CustomUserDetails customUserDetails =(CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = customUserDetails.getUser();
        UserResponse userResponse = UserResponse.builder()
                .user_Id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .roles(user.getRole())
                .build();

        return ResponseEntity.ok(userResponse);
    }
}
