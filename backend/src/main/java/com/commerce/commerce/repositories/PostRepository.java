package com.commerce.commerce.repositories;

import com.commerce.commerce.Models.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

public interface PostRepository extends JpaRepository<Post, Long> {}
