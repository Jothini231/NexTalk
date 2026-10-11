package com.chat.controller;

import com.chat.dto.ConversationSummaryDTO;
import com.chat.dto.MessageDTO;
import com.chat.dto.SendMessageRequest;
import com.chat.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /**
     * REST endpoint to retrieve conversation history between current user and another user
     */
    @GetMapping("/api/messages/{otherUserId}")
    public ResponseEntity<List<MessageDTO>> getConversationHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long otherUserId) {
        List<MessageDTO> messages = messageService.getConversationMessages(userDetails.getUsername(), otherUserId);
        return ResponseEntity.ok(messages);
    }

    /**
     * REST endpoint to retrieve all recent conversation threads
     */
    @GetMapping("/api/messages/conversations")
    public ResponseEntity<List<ConversationSummaryDTO>> getRecentConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ConversationSummaryDTO> conversations = messageService.getRecentConversations(userDetails.getUsername());
        return ResponseEntity.ok(conversations);
    }

    /**
     * REST fallback endpoint to send a message
     */
    @PostMapping("/api/messages")
    public ResponseEntity<MessageDTO> sendMessageViaRest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SendMessageRequest request) {
        MessageDTO message = messageService.sendMessage(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * WebSocket STOMP endpoint: clients send to "/app/chat.sendMessage"
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessageViaWebSocket(
            Principal principal,
            @Payload @Valid SendMessageRequest request) {
        if (principal != null) {
            messageService.sendMessage(principal.getName(), request);
        }
    }
}
