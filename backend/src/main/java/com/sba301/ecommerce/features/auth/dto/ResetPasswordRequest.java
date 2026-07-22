package com.sba301.ecommerce.features.auth.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    private String token;

    @Size(min = 8)
    private String password;
}
