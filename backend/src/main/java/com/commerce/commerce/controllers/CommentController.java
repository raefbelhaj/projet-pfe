package com.commerce.commerce.controllers;

import com.commerce.commerce.Models.Comment;
import com.commerce.commerce.Models.Post;
import com.commerce.commerce.repositories.CommentRepository;
import com.commerce.commerce.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {

    @Autowired private CommentRepository commentRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private SimpMessagingTemplate messaging;

    /** 🔹 Récupération des commentaires d’un post */
    @GetMapping
    public List<Comment> list(@PathVariable Long postId) {
        return commentRepo.findByPostIdOrderByCreatedAtAsc(postId);
    }

    /** 🔹 Création d’un commentaire + notification */
    @PostMapping
    public Comment create(@PathVariable Long postId, @RequestBody Comment c) {
        Post post = postRepo.findById(postId).orElseThrow();

        c.setPost(post);
        if (c.getUserId() == null) c.setUserId("temp-uid");
        if (c.getUserName() == null) c.setUserName("Dr. Anonyme");

        Comment saved = commentRepo.save(c);

        // ✅ Diffusion du commentaire
        messaging.convertAndSend("/topic/posts/" + postId + "/comments", saved);

        // ✅ Notification globale (filtrée côté client)
        NotificationDTO notif = new NotificationDTO(
                post.getId(),
                post.getUserId(),   // destinataire
                c.getUserId(),      // auteur du commentaire
                c.getUserName(),
                "a commenté votre publication",
                LocalDateTime.now().toString()
        );

        System.out.println("🔔 Diffusion notif globale → toUserId=" + post.getUserId());
        messaging.convertAndSend("/topic/notifications", notif);

        return saved;
    }

    /** 🔹 DTO Notification */
    public static class NotificationDTO {
        public Long postId;
        public String toUserId;
        public String fromUserId;
        public String fromUserName;
        public String content;
        public String createdAt;

        public NotificationDTO(Long postId, String toUserId, String fromUserId,
                               String fromUserName, String content, String createdAt) {
            this.postId = postId;
            this.toUserId = toUserId;
            this.fromUserId = fromUserId;
            this.fromUserName = fromUserName;
            this.content = content;
            this.createdAt = createdAt;
        }
    }
}
