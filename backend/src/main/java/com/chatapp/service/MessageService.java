package com.chatapp.service;

import com.chatapp.dto.AttachmentDto;
import com.chatapp.dto.MessageDto;
import com.chatapp.dto.MessageStatusUpdateDto;
import com.chatapp.dto.SendMessageRequest;
import com.chatapp.exception.BadRequestException;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.UnauthorizedException;
import com.chatapp.model.Attachment;
import com.chatapp.model.Chat;
import com.chatapp.model.Message;
import com.chatapp.model.User;
import com.chatapp.model.enums.MessageStatus;
import com.chatapp.model.enums.MessageType;
import com.chatapp.repository.ChatRepository;
import com.chatapp.repository.GroupMemberRepository;
import com.chatapp.repository.MessageRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserService userService;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(
            MessageRepository messageRepository,
            ChatRepository chatRepository,
            GroupMemberRepository groupMemberRepository,
            UserService userService,
            @Lazy ChatService chatService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userService = userService;
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public MessageDto sendMessage(SendMessageRequest request, User sender) {
        Chat chat = chatRepository.findById(request.getChatId())
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id: " + request.getChatId()));

        boolean isMember = groupMemberRepository.existsByChatIdAndUserId(chat.getId(), sender.getId());
        if (!isMember) {
            throw new UnauthorizedException("You are not a member of this chat");
        }

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setType(request.getType() != null ? request.getType() : MessageType.TEXT);
        message.setStatus(MessageStatus.SENT);
        message.setCreatedAt(LocalDateTime.now());

        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            for (AttachmentDto attDto : request.getAttachments()) {
                Attachment attachment = new Attachment();
                attachment.setFileName(attDto.getFileName());
                attachment.setFileType(attDto.getFileType());
                attachment.setFileUrl(attDto.getFileUrl());
                attachment.setFileSize(attDto.getFileSize());
                attachment.setDuration(attDto.getDuration());
                message.addAttachment(attachment);
            }
        }

        Message saved = messageRepository.save(message);

        // Update chat last message and time
        chat.setLastMessage(saved);
        chat.setUpdatedAt(LocalDateTime.now());
        Chat savedChat = chatRepository.save(chat);

        MessageDto dto = toDto(saved);

        // 1. Broadcast to WebSocket topic for this chat
        messagingTemplate.convertAndSend("/topic/chat." + chat.getId(), dto);

        // 2. Broadcast updated chat to each member's personal channel (so new chats appear immediately on the sidebar)
        try {
            chatService.notifyChatMembers(savedChat);
        } catch (Exception e) {
            // Log warning without failing message send
        }

        return dto;
    }

    public List<MessageDto> getChatMessages(Long chatId, User currentUser) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id: " + chatId));

        boolean isMember = groupMemberRepository.existsByChatIdAndUserId(chat.getId(), currentUser.getId());
        if (!isMember) {
            throw new UnauthorizedException("You are not a member of this chat");
        }

        List<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
        return messages.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markChatMessagesAsRead(Long chatId, User currentUser) {
        List<Long> unreadIds = messageRepository.findUnreadMessageIdsForChat(chatId, currentUser.getId());
        if (!unreadIds.isEmpty()) {
            messageRepository.updateMessagesStatusForChat(chatId, currentUser.getId(), MessageStatus.READ);

            MessageStatusUpdateDto updateDto = new MessageStatusUpdateDto(
                    chatId,
                    unreadIds,
                    MessageStatus.READ,
                    currentUser.getId()
            );

            // Broadcast read receipt to the chat
            messagingTemplate.convertAndSend("/topic/chat." + chatId + ".status", updateDto);
        }
    }

    public MessageDto toDto(Message message) {
        if (message == null) return null;

        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setChatId(message.getChat() != null ? message.getChat().getId() : null);
        dto.setSender(userService.toDto(message.getSender()));
        dto.setContent(message.getContent());
        dto.setType(message.getType());
        dto.setStatus(message.getStatus());
        dto.setCreatedAt(message.getCreatedAt());

        if (message.getAttachments() != null) {
            List<AttachmentDto> attachmentDtos = message.getAttachments().stream()
                    .map(att -> new AttachmentDto(
                            att.getId(),
                            att.getFileName(),
                            att.getFileType(),
                            att.getFileUrl(),
                            att.getFileSize(),
                            att.getDuration()
                    ))
                    .collect(Collectors.toList());
            dto.setAttachments(attachmentDtos);
        }

        return dto;
    }
}
