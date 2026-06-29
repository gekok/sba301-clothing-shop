package com.sba301.ecommerce.features.auth.dto;

import com.sba301.ecommerce.features.entities.enums.EmailVerificationType;
import lombok.*;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationEmailRequest {
    private String email;
    private String otp;
    private EmailVerificationType type = EmailVerificationType.REGISTERED;
}
