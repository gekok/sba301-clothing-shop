package com.sba301.ecommerce.features.auth.dto;

import com.sba301.ecommerce.features.entities.enums.Role;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long user_Id;
    private String name;
    private String email;
    private Role roles;
}
