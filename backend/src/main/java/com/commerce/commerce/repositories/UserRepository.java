package com.commerce.commerce.repositories;

import com.commerce.commerce.Models.User;
import com.commerce.commerce.enumeration.ERole;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);


    Optional<User> findByResetPasswordToken(String token);

    boolean existsByEmail (String email);

    List<User> findByRole_Name(ERole role);

}
