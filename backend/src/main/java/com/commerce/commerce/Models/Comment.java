package com.commerce.commerce.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Data
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Post post;

    private String userId;       // en prod: depuis JWT
    private String userName;     // idem
    @Column(length = 2000)
    private String content;

    private Instant createdAt = Instant.now();

    // getters/setters
}
