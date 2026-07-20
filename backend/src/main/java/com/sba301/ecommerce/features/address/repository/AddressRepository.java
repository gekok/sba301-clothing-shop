package com.sba301.ecommerce.features.address.repository;

import com.sba301.ecommerce.features.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
}
