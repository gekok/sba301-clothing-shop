package com.sba301.ecommerce.features.auth.repositories;

import com.sba301.ecommerce.features.entities.PasswordResetToken;
import com.sba301.ecommerce.features.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findPasswordResetTokenByUser(User user);
    void deleteAllByUser(User user);
}
