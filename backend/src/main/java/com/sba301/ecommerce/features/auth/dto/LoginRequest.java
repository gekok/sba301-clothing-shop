package com.sba301.ecommerce.features.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

// TODO: fields @Email @NotBlank String email; @NotBlank String password;  (Lombok @Getter @Setter hoặc record)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank
//    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@gmail\\.com$",message = "Email errors constructor")
    @Email
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
//    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,20}$",message = "Mật khẩu phải từ 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)")
    private String password;
}
