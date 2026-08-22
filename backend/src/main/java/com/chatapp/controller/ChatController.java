package com.chatapp.controller;

import com.chatapp.dto.ChatDto;
import com.chatapp.dto.CreateDirectChatRequest;
import com.chatapp.dto.CreateGroupRequest;
import com.chatapp.dto.UpdateGroupRequest;
import com.chatapp.model.User;
import com.chatapp.service.ChatService;
import com.chatapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<ChatDto>> getMyChats() {
        User currentUser = userService.getCurrentUserEntity();
        return ResponseEntity.ok(chatService.getUserChats(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatDto> getChatById(@PathVariable Long id) {
        User currentUser = userService.getCurrentUserEntity();
        return ResponseEntity.ok(chatService.getChatDto(id, currentUser));
    }

    @PostMapping("/direct")
    public ResponseEntity<ChatDto> createOrGetDirectChat(@Valid @RequestBody CreateDirectChatRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        ChatDto chatDto = chatService.getOrCreateDirectChat(currentUser, request.getTargetUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(chatDto);
    }

    @PostMapping("/group")
    public ResponseEntity<ChatDto> createGroupChat(@Valid @RequestBody CreateGroupRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        ChatDto chatDto = chatService.createGroupChat(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(chatDto);
    }

    @PutMapping("/group/{id}")
    public ResponseEntity<ChatDto> updateGroupChat(@PathVariable Long id, @RequestBody UpdateGroupRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        ChatDto chatDto = chatService.updateGroupChat(currentUser, id, request);
        return ResponseEntity.ok(chatDto);
    }
}
