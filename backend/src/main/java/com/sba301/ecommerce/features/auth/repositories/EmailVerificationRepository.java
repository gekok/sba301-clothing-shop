package com.sba301.ecommerce.features.auth.repositories;

import com.sba301.ecommerce.features.entities.EmailVerification;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.EmailVerificationType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long>, JpaSpecificationExecutor<EmailVerification> {
    Optional<EmailVerification> findEmailVerificationByUserAndType(@NotNull User user, @Size(max = 30) @NotNull EmailVerificationType type);
}
