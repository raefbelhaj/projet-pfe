package com.commerce.commerce.controllers.Authentification;

import com.commerce.commerce.Service.Authentification.ForgotPasswordService;
import com.commerce.commerce.dtos.Authentification.ForgotPasswordDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    public ForgotPasswordController(ForgotPasswordService forgotPasswordService) {
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordDto forgotPasswordDto) {
        forgotPasswordService.sendPasswordResetLink(forgotPasswordDto);
        return ResponseEntity.ok("Un lien de réinitialisation a été envoyé à votre email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam("token") String token,
            @RequestBody Map<String, String> payload) {

        System.out.println("Requête reçue pour réinitialiser le mot de passe avec le token : " + token);

        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.isEmpty()) {
            System.out.println("Le mot de passe est vide !");
            return ResponseEntity.badRequest().body("Le mot de passe ne peut pas être vide.");
        }

        boolean success = forgotPasswordService.resetPassword(token, newPassword);

        if (success) {
            System.out.println("Mot de passe réinitialisé avec succès !");
            return ResponseEntity.ok("Mot de passe réinitialisé avec succès !");
        } else {
            System.out.println("Échec : Token invalide ou utilisateur introuvable.");
            return ResponseEntity.status(400).body("Token invalide ou utilisateur introuvable.");
        }
    }

}
