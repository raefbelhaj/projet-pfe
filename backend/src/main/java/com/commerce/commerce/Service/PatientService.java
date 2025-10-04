/*
package com.commerce.commerce.Service;

import com.commerce.commerce.Models.Patient;
import com.commerce.commerce.dtos.PatientDTO;
import com.commerce.commerce.repositories.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {
    @Autowired
    private PatientRepository patientRepository;

    public PatientDTO savePatient(PatientDTO patientDTO) {
        Patient patient = new Patient();
        patient.setNom(patientDTO.getNom());
        patient.setPrenom(patientDTO.getPrenom());
        patient.setEmail(patientDTO.getEmail());
        patient.setNumeroTelephone(patientDTO.getNumeroTelephone());

        Patient savedPatient = patientRepository.save(patient);

        return new PatientDTO(
                savedPatient.getId(),
                savedPatient.getNom(),
                savedPatient.getPrenom(),
                savedPatient.getEmail(),
                savedPatient.getNumeroTelephone()
        );
    }

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(patient -> new PatientDTO(
                        patient.getId(),
                        patient.getNom(),
                        patient.getPrenom(),
                        patient.getEmail(),
                        patient.getNumeroTelephone()
                ))
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        return new PatientDTO(
                patient.getId(),
                patient.getNom(),
                patient.getPrenom(),
                patient.getEmail(),
                patient.getNumeroTelephone()
        );
    }

    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        patient.setNom(patientDTO.getNom());
        patient.setPrenom(patientDTO.getPrenom());
        patient.setEmail(patientDTO.getEmail());
        patient.setNumeroTelephone(patientDTO.getNumeroTelephone());

        Patient updatedPatient = patientRepository.save(patient);

        return new PatientDTO(
                updatedPatient.getId(),
                updatedPatient.getNom(),
                updatedPatient.getPrenom(),
                updatedPatient.getEmail(),
                updatedPatient.getNumeroTelephone()
        );
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
*/