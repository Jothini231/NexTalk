package com.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private String senderFullName;
    private String senderAvatarUrl;
    private Long recipientId;
    private String recipientUsername;
    private String recipientFullName;
    private String recipientAvatarUrl;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
}
