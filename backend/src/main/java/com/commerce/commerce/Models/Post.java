package com.commerce.commerce.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;


@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Data
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String authorName;         // en prod: déduit du JWT
    private String authorSpecialty;

    @Column(length = 5000)
    private String content;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageBase64;


    private Instant createdAt = Instant.now();

    // getters/setters
}
