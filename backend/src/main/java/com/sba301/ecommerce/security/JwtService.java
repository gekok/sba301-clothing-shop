package com.sba301.ecommerce.security;

import org.springframework.stereotype.Service;

// TODO: sign/parse JWT bằng app.jwt.secret + app.jwt.expiration-ms.
//   Key:   Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))  (secret PHẢI >= 32 byte base64)
//   Build: Jwts.builder().subject(email).claim("role", role).issuedAt(..).expiration(..).signWith(key).compact()
//   Parse: Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload()   (0.12.x, KHÔNG getBody())
//   Methods: String generateToken(email, role); String extractEmail(token); boolean isValid(token);
@Service
public class JwtService {
}
