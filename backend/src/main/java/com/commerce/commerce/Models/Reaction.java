package com.commerce.commerce.Models;

import com.commerce.commerce.enumeration.ReactionType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"post_id","userId","type"}))
public class Reaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Post post;

    private String userId; // depuis JWT
    @Enumerated(EnumType.STRING)
    private ReactionType type;

    private Instant createdAt = Instant.now();

    // getters/setters
}
