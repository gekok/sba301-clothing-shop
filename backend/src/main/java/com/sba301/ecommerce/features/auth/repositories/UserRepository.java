package com.sba301.ecommerce.features.auth.repositories;

import com.sba301.ecommerce.features.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// TODO: Optional<User> findByEmail(String email); boolean existsByEmail(String email);
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    boolean existsUserByEmail(String email);
    Optional<User> findUserByEmail(String email);
}
