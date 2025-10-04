package com.commerce.commerce.repositories;

import com.commerce.commerce.Models.Role;
import com.commerce.commerce.enumeration.ERole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);

}