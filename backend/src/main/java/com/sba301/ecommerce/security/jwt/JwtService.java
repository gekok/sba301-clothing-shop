package com.sba301.ecommerce.security.jwt;


import com.sba301.ecommerce.security.user.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;


// TODO: sign/parse JWT bằng app.jwt.secret + app.jwt.expiration-ms.
//   Key:   Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))  (secret PHẢI >= 32 byte base64)
//   Build: Jwts.builder().subject(email).claim("role", role).issuedAt(..).expiration(..).signWith(key).compact()
//   Parse: Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload()   (0.12.x, KHÔNG getBody())
//   Methods: String generateToken(email, role); String extractEmail(token); boolean isValid(token);
@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    
    public String generateJwtToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role",userDetails.getAuthorities().iterator().next().getAuthority());
        claims.put("email",userDetails.getEmail());
        claims.put("user_id",userDetails.getId().toString());

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSigningKey(),Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes =
                Decoders.BASE64.decode(secret);

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims getAllClaims(String token) {
        return  Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean validateJwtToken(String token, CustomUserDetails userDetails) {
        String email = getEmailFromToken(token);
        return (email.equals(userDetails.getEmail()) && !isTokenExpired(token));
    }

    public Boolean isTokenExpired(String token) {
        return getAllClaims(token).getExpiration().before(new Date());
    }

    public String getEmailFromToken(String token) {
        return getAllClaims(token).getSubject();
    }
}
