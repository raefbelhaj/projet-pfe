package com.commerce.commerce.Service.Authentification;

import com.commerce.commerce.Models.User;
import com.commerce.commerce.dtos.Authentification.LoginUserDto;
import com.commerce.commerce.enumeration.ERole;
import com.commerce.commerce.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;  // Import correct
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public User authenticate(LoginUserDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()
                )
        );

        return userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // get all users
    public List<User> AllUsers() {
        return userRepository.findAll();
    }


    // pagination
    /*public Page<User> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);  // Créer une instance de Pageable avec la page et la taille
        return userRepository.findAll(pageable);  // Appeler findAll pour récupérer les utilisateurs paginés
    }

     */

    public Page<User> getUsers(int page, int size, String role) {
        Pageable pageable = PageRequest.of(page, size);

        if (role != null && !role.isEmpty()) {
            ERole roleEnum = ERole.valueOf(role);
            return (Page<User>) userRepository.findByRole_Name(roleEnum);
        } else {
            return userRepository.findAll(pageable);
        }
    }


    // Récupérer les utilisateurs par rôle
    public List<User> getUsersByRole(String role) {
        try {
            ERole eRole = ERole.valueOf(role);
            return (List<User>) userRepository.findByRole_Name(eRole);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Rôle invalide : " + role);
        }
    }
}
