package com.commerce.commerce.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Data
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;            // identifiant du créateur
    private String authorName;        // nom complet de l’auteur
    private String authorSpecialty;   // spécialité

    @Column(length = 5000)
    private String content;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageBase64;

    private Instant createdAt = Instant.now();
}
