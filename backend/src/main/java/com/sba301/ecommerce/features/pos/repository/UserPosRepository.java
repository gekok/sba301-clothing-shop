package com.sba301.ecommerce.features.pos.repository;
import com.sba301.ecommerce.features.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

// TODO: Optional<User> findByEmail(String email); boolean existsByEmail(String email);
@Repository
public interface UserPosRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    boolean existsUserByEmail(String email);
    User findUserByEmail(String email);
}
