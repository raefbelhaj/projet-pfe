package com.commerce.commerce.controllers.Authentification;

import com.commerce.commerce.Models.Role;
import com.commerce.commerce.Models.User;
import com.commerce.commerce.Service.Authentification.JwtService;
import com.commerce.commerce.Service.Authentification.UserService;
import com.commerce.commerce.dtos.Authentification.LoginUserDto;
import com.commerce.commerce.dtos.Authentification.UserSignupDTO;
import com.commerce.commerce.dtos.GestionUser.UpdateProfileDTO;
import com.commerce.commerce.enumeration.ERole;
import com.commerce.commerce.repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody UserSignupDTO userSignupDTO) {
        Map<String, String> response = new HashMap<>();

        if (userService.existsByEmail(userSignupDTO.getEmail())) {
            response.put("message", "Email already in use.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Create User entity
        User user = new User();
        user.setFullName(userSignupDTO.getFullName());
        user.setEmail(userSignupDTO.getEmail());
        user.setPassword(userSignupDTO.getPassword()); // Hash this password if needed
        user.setPhoneNumber(userSignupDTO.getPhoneNumber());

        // Get the role
        Role role = roleRepository.findByName(ERole.valueOf(userSignupDTO.getRole()))
                .orElseThrow(() -> new RuntimeException("Role not found."));
        user.setRole(role);

        // Assign role-specific fields
        if (role.getName() == ERole.ROLE_PATIENT) {
            user.setDateOfBirth(userSignupDTO.getPatientDTO().getDateOfBirth());
            user.setGender(userSignupDTO.getPatientDTO().getGender());
            user.setAddress(userSignupDTO.getPatientDTO().getAddress());
        } else if (role.getName() == ERole.ROLE_DOCTOR) {
            user.setSpecialty(userSignupDTO.getDoctorDTO().getSpecialty());
            user.setMedicalLicenseNumber(userSignupDTO.getDoctorDTO().getMedicalLicenseNumber());
            user.setHospitalOrClinic(userSignupDTO.getDoctorDTO().getHospitalOrClinic());
            user.setGender(userSignupDTO.getDoctorDTO().getGender());
            user.setAddress(userSignupDTO.getDoctorDTO().getAddress());
        } else if (role.getName() == ERole.ROLE_ORGANIZATION) {
            user.setType(userSignupDTO.getOrganizationDTO().getType());
            user.setAddress(userSignupDTO.getOrganizationDTO().getAdress());
            user.setCity(userSignupDTO.getOrganizationDTO().getCity());
        }

        // Save the user
        userService.saveUser(user);

        response.put("message", "User registered successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = userService.authenticate(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);
        long expiresIn = jwtService.getExpirationTime();

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("expiresIn", expiresIn);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> allUsers = userService.AllUsers();
        return ResponseEntity.ok(allUsers);
    }

    @GetMapping("/get/pagi")
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {

        Page<User> usersPage = userService.getUsers(page, size, role);
        return new ResponseEntity<>(usersPage, HttpStatus.OK);
    }

    @GetMapping("/get/Patients")
    public ResponseEntity<List<User>> getPatient() {
        List<User> patients = userService.getUsersByRole("ROLE_PATIENT");
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/get/Doctors")
    public ResponseEntity<List<User>> getDoctor() {
        List<User> doctors = userService.getUsersByRole("ROLE_DOCTOR");
        return ResponseEntity.ok(doctors);
    }

    // get connected user
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        User user = userService.getAuthenticatedUser();
        return ResponseEntity.ok(user);
    }

    // update information de user
    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileDTO profileDTO) {
        User user = userService.getAuthenticatedUser();

        // ✅ On garde l'ancien mot de passe
        String oldPassword = user.getPassword();

        // ✅ On met à jour seulement les infos profil
        user.setFullName(profileDTO.getFullName());
        user.setPhoneNumber(profileDTO.getPhoneNumber());
        user.setAddress(profileDTO.getAddress());

        // ✅ On restaure l'ancien mot de passe
        user.setPassword(oldPassword);

        // ✅ Sauvegarde sans perturber le hash
        User updatedUser = userService.saveUserWithoutRehash(user);

        return ResponseEntity.ok(updatedUser);
    }



}
