package com.commerce.commerce.controllers;

import com.commerce.commerce.Models.Post;
import com.commerce.commerce.Models.Reaction;
import com.commerce.commerce.enumeration.ReactionType;
import com.commerce.commerce.repositories.PostRepository;
import com.commerce.commerce.repositories.ReactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/reactions")
@CrossOrigin(origins = "http://localhost:4200")
public class ReactionController {
    @Autowired private ReactionRepository reactionRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private SimpMessagingTemplate messaging;

    static record ReactionSummary(long like,long clap,long insightful, boolean meLike, boolean meClap, boolean meInsightful){}

    @GetMapping
    public ReactionSummary summary(@PathVariable Long postId, @RequestParam String userId) {
        long like = reactionRepo.countByPostIdAndType(postId, ReactionType.LIKE);
        long clap = reactionRepo.countByPostIdAndType(postId, ReactionType.CLAP);
        long ins = reactionRepo.countByPostIdAndType(postId, ReactionType.INSIGHTFUL);

        boolean meLike = reactionRepo.existsByPostIdAndUserIdAndType(postId, userId, ReactionType.LIKE);
        boolean meClap = reactionRepo.existsByPostIdAndUserIdAndType(postId, userId, ReactionType.CLAP);
        boolean meInsightful = reactionRepo.existsByPostIdAndUserIdAndType(postId, userId, ReactionType.INSIGHTFUL);

        return new ReactionSummary(like,clap,ins, meLike,meClap,meInsightful);
    }

    @PostMapping("/{type}/toggle")
    public ReactionSummary toggle(@PathVariable Long postId, @PathVariable ReactionType type, @RequestParam String userId) {
        Post post = postRepo.findById(postId).orElseThrow();

        if (reactionRepo.existsByPostIdAndUserIdAndType(postId, userId, type)) {
            reactionRepo.deleteByPostIdAndUserIdAndType(postId, userId, type);
        } else {
            Reaction r = new Reaction();
            r.setPost(post);
            r.setUserId(userId);
            r.setType(type);
            reactionRepo.save(r);
        }

        long like = reactionRepo.countByPostIdAndType(postId, ReactionType.LIKE);
        long clap = reactionRepo.countByPostIdAndType(postId, ReactionType.CLAP);
        long ins  = reactionRepo.countByPostIdAndType(postId, ReactionType.INSIGHTFUL);

        ReactionSummary s = new ReactionSummary(
                like,clap,ins,
                reactionRepo.existsByPostIdAndUserIdAndType(postId, userId, ReactionType.LIKE),
                reactionRepo.existsByPostIdAndUserIdAndType(postId, userId, ReactionType.CLAP),
                reactionRepo.existsByPostIdAndUserIdAndType(postId, userId, ReactionType.INSIGHTFUL)
        );

        messaging.convertAndSend("/topic/posts/" + postId + "/reactions", s);
        return s;
    }
}
