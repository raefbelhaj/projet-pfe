package com.commerce.commerce.Service.Authentification;

import com.commerce.commerce.dtos.Authentification.ForgotPasswordDto;
import com.commerce.commerce.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ForgotPasswordService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public ForgotPasswordService(
            UserRepository userRepository,
            JavaMailSender mailSender,
            JwtService jwtService,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public void sendPasswordResetLink(ForgotPasswordDto forgotPasswordDto) {
        // Vérifier si l'utilisateur existe
        userRepository.findByEmail(forgotPasswordDto.getEmail())
                .ifPresent(user -> {
                    String token = UUID.randomUUID().toString();  // Créer un token de réinitialisation unique

                    // Enregistrer le token dans la base de données pour valider la demande
                    user.setResetPasswordToken(token);
                    userRepository.save(user);

                    // Construire le lien de réinitialisation
                    String resetLink = "http://localhost:8000/auth/reset-password?token=" + token;

                    // Envoyer l'email avec le lien de réinitialisation
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setFrom(fromEmail);
                    message.setTo(user.getEmail());
                    message.setSubject("Réinitialisation du mot de passe");
                    message.setText("Cliquez sur ce lien pour réinitialiser votre mot de passe : " + resetLink);

                    mailSender.send(message);
                });
        // Note : Si l'utilisateur n'est pas trouvé, rien ne se passe (c'est intentionnel ici).
    }

    public boolean resetPassword(String token, String newPassword) {
        // Trouver l'utilisateur par token
        return userRepository.findByResetPasswordToken(token)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setResetPasswordToken(null);  // Supprimer le token après utilisation
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);  // Retourne false si l'utilisateur n'est pas trouvé
    }
}
