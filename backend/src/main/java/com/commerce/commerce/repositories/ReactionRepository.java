package com.commerce.commerce.repositories;

import com.commerce.commerce.Models.Reaction;
import com.commerce.commerce.enumeration.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    long countByPostIdAndType(Long postId, ReactionType type);
    boolean existsByPostIdAndUserIdAndType(Long postId, String userId, ReactionType type);
    void deleteByPostIdAndUserIdAndType(Long postId, String userId, ReactionType type);
    List<Reaction> findByPostId(Long postId);
}
