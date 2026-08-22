package com.chatapp.controller;

import com.chatapp.dto.MessageDto;
import com.chatapp.dto.SendMessageRequest;
import com.chatapp.model.User;
import com.chatapp.service.MessageService;
import com.chatapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    public MessageController(MessageService messageService, UserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        MessageDto messageDto = messageService.sendMessage(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(messageDto);
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDto>> getChatMessages(@PathVariable Long chatId) {
        User currentUser = userService.getCurrentUserEntity();
        return ResponseEntity.ok(messageService.getChatMessages(chatId, currentUser));
    }

    @PostMapping("/read/{chatId}")
    public ResponseEntity<Map<String, String>> markMessagesAsRead(@PathVariable Long chatId) {
        User currentUser = userService.getCurrentUserEntity();
        messageService.markChatMessagesAsRead(chatId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }
}
