package com.commerce.commerce.controllers;

import com.commerce.commerce.Models.Comment;
import com.commerce.commerce.Models.Post;
import com.commerce.commerce.repositories.CommentRepository;
import com.commerce.commerce.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {
    @Autowired private CommentRepository commentRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private SimpMessagingTemplate messaging;

    @GetMapping
    public List<Comment> list(@PathVariable Long postId) {
        return commentRepo.findByPostIdOrderByCreatedAtAsc(postId);
    }

    @PostMapping
    public Comment create(@PathVariable Long postId, @RequestBody Comment c) {
        Post post = postRepo.findById(postId).orElseThrow();
        c.setPost(post);
        // En prod: userId/userName depuis JWT
        if (c.getUserId() == null) c.setUserId("u-123");
        if (c.getUserName() == null) c.setUserName("Dr. Anonyme");

        Comment saved = commentRepo.save(c);
        messaging.convertAndSend("/topic/posts/" + postId + "/comments", saved);
        return saved;
    }
}
