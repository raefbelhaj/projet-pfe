package com.commerce.commerce.Models;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;

@Data
@Entity
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String fullName;

    private String PhoneNumber ;

    @Column(unique = true, length = 100, nullable = false)
    private String email;

    private String password;

    @CreationTimestamp
    @Column(updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    private Date updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.DETACH)
    @JoinColumn(name = "ID_ROLE")
    private Role role;

    private String resetPasswordToken;

    @Column(name = "profile_image")
    private String profileImage; // ex: "uploads/user_5.png"


    // Optional fields for specific roles  ( patient et doctor )
    private String dateOfBirth;
    private String gender;
    private String address;
    private String specialty;
    private String medicalLicenseNumber;
    private String hospitalOrClinic;

    //field organization
    private String type ;
    private String Batiment ;
    private String city ;

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    @Override
    public String getUsername() { return email; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return null; }
}