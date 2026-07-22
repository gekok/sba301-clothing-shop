package com.sba301.ecommerce.features.auth.dto;

import lombok.*;

// TODO: accessToken; tokenType="Bearer"; userId; email; fullName; role.
//   FE đọc res.data.accessToken -> lưu localStorage 'accessToken'.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
}
