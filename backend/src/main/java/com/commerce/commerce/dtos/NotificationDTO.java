package com.commerce.commerce.dtos;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {
    private Long postId;
    private String toUserId;
    private String fromUserId;
    private String fromUserName;
    private String content;
    private LocalDateTime createdAt;
}
