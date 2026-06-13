package com.sba301.ecommerce.features.auth.repository;

import com.sba301.ecommerce.features.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// TODO: Optional<User> findByEmail(String email); boolean existsByEmail(String email);
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
