package com.commerce.commerce.dtos.Authentification;


import lombok.Data;

@Data
public class UserSignupDTO {

        private String fullName;
        private String email;
        private String password;
        private String PhoneNumber;
        private String role; // ROLE_PATIENT, ROLE_DOCTOR, etc.

        private PatientDTO patientDTO;
        private DoctorDTO doctorDTO;
        private OrganizationDTO organizationDTO ;


}
