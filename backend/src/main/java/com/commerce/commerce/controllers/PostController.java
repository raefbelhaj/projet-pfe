package com.commerce.commerce.controllers;

import com.commerce.commerce.Models.Post;
import com.commerce.commerce.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {
    @Autowired private PostRepository postRepo;
    @Autowired private SimpMessagingTemplate messaging;

    @GetMapping
    public List<Post> all() {
        return postRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping
    public Post create(@RequestBody Post p) {
        // En prod: remplir author* depuis JWT
        Post saved = postRepo.save(p);
        messaging.convertAndSend("/topic/posts", saved);
        return saved;
    }
}
