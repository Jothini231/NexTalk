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
public class ConversationSummaryDTO {
    private Long otherUserId;
    private String otherUsername;
    private String otherFullName;
    private String otherAvatarUrl;
    private boolean otherUserOnline;
    private String lastMessage;
    private LocalDateTime lastMessageTimestamp;
    private Long lastMessageSenderId;
}
