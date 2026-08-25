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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final com.chatapp.repository.MessageReactionRepository messageReactionRepository;
    private final UserService userService;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(
            MessageRepository messageRepository,
            ChatRepository chatRepository,
            GroupMemberRepository groupMemberRepository,
            com.chatapp.repository.MessageReactionRepository messageReactionRepository,
            UserService userService,
            @Lazy ChatService chatService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.messageReactionRepository = messageReactionRepository;
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

        if (request.getReplyToId() != null) {
            messageRepository.findById(request.getReplyToId()).ifPresent(parent -> {
                if (parent.getChat() != null && parent.getChat().getId().equals(chat.getId())) {
                    message.setParentMessage(parent);
                }
            });
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
                .map(m -> this.toDto(m, currentUser))
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

    @Transactional
    public MessageDto toggleReaction(Long messageId, String emoji, User currentUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        boolean isMember = groupMemberRepository.existsByChatIdAndUserId(message.getChat().getId(), currentUser.getId());
        if (!isMember) {
            throw new UnauthorizedException("You are not a member of this chat");
        }

        var existingOpt = messageReactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, currentUser.getId(), emoji);
        if (existingOpt.isPresent()) {
            messageReactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, currentUser.getId(), emoji);
        } else {
            com.chatapp.model.MessageReaction reaction = new com.chatapp.model.MessageReaction(message, currentUser, emoji);
            messageReactionRepository.save(reaction);
        }

        // Fetch fresh message entity with updated reactions
        Message freshMessage = messageRepository.findById(messageId).orElse(message);
        MessageDto dto = toDto(freshMessage, currentUser);

        // Broadcast reaction update to chat subscribers
        messagingTemplate.convertAndSend("/topic/chat." + message.getChat().getId() + ".reactions", dto);

        return dto;
    }

    public MessageDto toDto(Message message) {
        return toDto(message, null);
    }

    public MessageDto toDto(Message message, User currentUser) {
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

        List<com.chatapp.model.MessageReaction> reactions = messageReactionRepository.findByMessageId(message.getId());
        if (reactions != null && !reactions.isEmpty()) {
            java.util.Map<String, List<com.chatapp.model.MessageReaction>> grouped = reactions.stream()
                    .collect(Collectors.groupingBy(com.chatapp.model.MessageReaction::getEmoji));

            List<com.chatapp.dto.ReactionDto> reactionDtos = new ArrayList<>();
            for (var entry : grouped.entrySet()) {
                String emoji = entry.getKey();
                List<com.chatapp.model.MessageReaction> reactionList = entry.getValue();
                List<com.chatapp.dto.UserDto> userDtos = reactionList.stream()
                        .map(r -> userService.toDto(r.getUser()))
                        .collect(Collectors.toList());

                boolean reactedByMe = currentUser != null && reactionList.stream()
                        .anyMatch(r -> r.getUser().getId().equals(currentUser.getId()));

                reactionDtos.add(new com.chatapp.dto.ReactionDto(
                        emoji,
                        reactionList.size(),
                        userDtos,
                        reactedByMe
                ));
            }
            dto.setReactions(reactionDtos);
        }

        if (message.getParentMessage() != null) {
            Message parent = message.getParentMessage();
            String senderName = parent.getSender() != null
                    ? (parent.getSender().getDisplayName() != null && !parent.getSender().getDisplayName().isBlank()
                            ? parent.getSender().getDisplayName()
                            : parent.getSender().getUsername())
                    : "System";
            Long senderId = parent.getSender() != null ? parent.getSender().getId() : null;
            dto.setReplyTo(new com.chatapp.dto.ReplyMessageDto(
                    parent.getId(),
                    senderId,
                    senderName,
                    parent.getContent(),
                    parent.getType()
            ));
        }

        return dto;
    }
}
