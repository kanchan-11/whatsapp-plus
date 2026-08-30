package com.chatapp.controller;

import com.chatapp.dto.SendMessageRequest;
import com.chatapp.dto.TypingNotification;
import com.chatapp.dto.UserPresenceDto;
import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.MessageService;
import com.chatapp.service.UserService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class WebSocketChatController {

    private final MessageService messageService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final com.chatapp.service.PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketChatController(
            MessageService messageService,
            UserService userService,
            UserRepository userRepository,
            com.chatapp.service.PresenceService presenceService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messageService = messageService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void handleSendMessage(@Payload SendMessageRequest request) {
        // Find sender user from database
        // In case of WebSocket messages where headers might carry sender info or standard context
        try {
            User sender = userService.getCurrentUserEntity();
            messageService.sendMessage(request, sender);
        } catch (Exception e) {
            // Fallback or error logging
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingNotification typingNotification) {
        if (typingNotification != null && typingNotification.getChatId() != null) {
            messagingTemplate.convertAndSend(
                    "/topic/chat." + typingNotification.getChatId() + ".typing",
                    typingNotification
            );
        }
    }

    @MessageMapping("/user.presence")
    public void handlePresence(@Payload UserPresenceDto presenceDto) {
        if (presenceDto != null && presenceDto.getUserId() != null) {
            if (presenceDto.isOnline()) {
                presenceService.markOnline(presenceDto.getUserId(), presenceDto.getUsername());
            } else {
                presenceService.markOffline(presenceDto.getUserId(), presenceDto.getUsername());
            }
            userService.setOnlineStatus(presenceDto.getUserId(), presenceDto.isOnline());
        }
    }

    @MessageMapping("/user.heartbeat")
    public void handleHeartbeat(@Payload UserPresenceDto presenceDto) {
        if (presenceDto != null && presenceDto.getUserId() != null) {
            presenceService.heartbeat(presenceDto.getUserId(), presenceDto.getUsername());
        }
    }
}
