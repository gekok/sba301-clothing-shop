package com.sba301.ecommerce.features.auth.dto;

import com.sba301.ecommerce.features.entities.enums.Role;
import com.sba301.ecommerce.features.entities.enums.UserStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

// TODO: @Email @NotBlank email; @NotBlank @Size(min=6) password; @NotBlank fullName; phone.
//   role KHÔNG nhận từ client — ép CUSTOMER server-side.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Email not blanked")
    @Email
    @Size(min=5,max = 50)
    private String email;

    @NotBlank
    @Size(min=8)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role roles = Role.CUSTOMER;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.PENDING;

}
