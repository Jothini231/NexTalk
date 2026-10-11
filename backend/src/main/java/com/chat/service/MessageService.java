package com.chat.service;

import com.chat.dto.ConversationSummaryDTO;
import com.chat.dto.MessageDTO;
import com.chat.dto.SendMessageRequest;
import com.chat.entity.Message;
import com.chat.entity.User;
import com.chat.exception.ResourceNotFoundException;
import com.chat.repository.MessageRepository;
import com.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageDTO sendMessage(String senderUsername, SendMessageRequest request) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + senderUsername));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found with id: " + request.getRecipientId()));

        boolean isSelfChat = sender.getId().equals(recipient.getId());

        Message message = Message.builder()
                .sender(sender)
                .recipient(recipient)
                .content(request.getContent().trim())
                .isRead(isSelfChat)
                .build();

        Message savedMessage = messageRepository.save(message);
        MessageDTO messageDTO = mapToDTO(savedMessage);

        // Deliver message instantly to recipient's private destination
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/messages",
                messageDTO
        );

        // Also echo back to sender's private destination so other tabs/devices receive it
        messagingTemplate.convertAndSendToUser(
                sender.getUsername(),
                "/queue/messages",
                messageDTO
        );

        return messageDTO;
    }

    @Transactional
    public List<MessageDTO> getConversationMessages(String currentUsername, Long otherUserId) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        // Verify other user exists
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + otherUserId));

        // Mark incoming messages from the other user as read
        int updatedCount = messageRepository.markMessagesAsRead(otherUser.getId(), currentUser.getId());
        if (updatedCount > 0) {
            // Notify the sender that their messages have been read
            messagingTemplate.convertAndSendToUser(
                    otherUser.getUsername(),
                    "/queue/read-receipts",
                    java.util.Map.of("readerId", currentUser.getId(), "read", true)
            );
        }

        return messageRepository.findConversationMessages(currentUser.getId(), otherUserId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDTO> getRecentConversations(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        List<Message> latestMessages = messageRepository.findRecentConversations(currentUser.getId());
        List<ConversationSummaryDTO> summaries = new ArrayList<>();

        for (Message msg : latestMessages) {
            User otherUser = msg.getSender().getId().equals(currentUser.getId())
                    ? msg.getRecipient()
                    : msg.getSender();

            summaries.add(ConversationSummaryDTO.builder()
                    .otherUserId(otherUser.getId())
                    .otherUsername(otherUser.getUsername())
                    .otherFullName(otherUser.getFullName())
                    .otherAvatarUrl(otherUser.getAvatarUrl())
                    .otherUserOnline(otherUser.isOnline())
                    .lastMessage(msg.getContent())
                    .lastMessageTimestamp(msg.getTimestamp())
                    .lastMessageSenderId(msg.getSender().getId())
                    .build());
        }

        return summaries;
    }

    private MessageDTO mapToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .senderFullName(message.getSender().getFullName())
                .senderAvatarUrl(message.getSender().getAvatarUrl())
                .recipientId(message.getRecipient().getId())
                .recipientUsername(message.getRecipient().getUsername())
                .recipientFullName(message.getRecipient().getFullName())
                .recipientAvatarUrl(message.getRecipient().getAvatarUrl())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .isRead(message.isRead())
                .build();
    }
}
