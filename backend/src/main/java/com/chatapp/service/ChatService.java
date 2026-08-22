package com.chatapp.service;

import com.chatapp.dto.*;
import com.chatapp.exception.BadRequestException;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.UnauthorizedException;
import com.chatapp.model.Chat;
import com.chatapp.model.GroupMember;
import com.chatapp.model.User;
import com.chatapp.model.enums.ChatType;
import com.chatapp.model.enums.GroupRole;
import com.chatapp.repository.ChatRepository;
import com.chatapp.repository.GroupMemberRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(
            ChatRepository chatRepository,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository,
            MessageRepository messageRepository,
            UserService userService,
            @Lazy MessageService messageService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.chatRepository = chatRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    public List<ChatDto> getUserChats(User currentUser) {
        List<Chat> chats = chatRepository.findChatsByUserId(currentUser.getId());
        return chats.stream()
                .map(chat -> toDto(chat, currentUser))
                .collect(Collectors.toList());
    }

    public Chat getChatEntity(Long chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id: " + chatId));
    }

    public ChatDto getChatDto(Long chatId, User currentUser) {
        Chat chat = getChatEntity(chatId);
        boolean isMember = chat.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
        if (!isMember) {
            throw new UnauthorizedException("You are not a member of this chat");
        }
        return toDto(chat, currentUser);
    }

    @Transactional
    public ChatDto getOrCreateDirectChat(User currentUser, Long targetUserId) {
        if (currentUser.getId().equals(targetUserId)) {
            throw new BadRequestException("You cannot start a direct chat with yourself");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found: " + targetUserId));

        Optional<Chat> existing = chatRepository.findDirectChatBetweenUsers(currentUser.getId(), targetUserId);
        if (existing.isPresent()) {
            return toDto(existing.get(), currentUser);
        }

        Chat newChat = new Chat();
        newChat.setType(ChatType.DIRECT);
        newChat.setCreatedBy(currentUser);
        newChat.setCreatedAt(LocalDateTime.now());
        newChat.setUpdatedAt(LocalDateTime.now());
        Chat savedChat = chatRepository.save(newChat);

        GroupMember member1 = new GroupMember(savedChat, currentUser, GroupRole.MEMBER);
        GroupMember member2 = new GroupMember(savedChat, targetUser, GroupRole.MEMBER);
        groupMemberRepository.save(member1);
        groupMemberRepository.save(member2);

        savedChat.getMembers().add(member1);
        savedChat.getMembers().add(member2);

        // Notify both users in real-time about the newly created chat
        notifyChatMembers(savedChat);

        return toDto(savedChat, currentUser);
    }

    @Transactional
    public ChatDto createGroupChat(User currentUser, CreateGroupRequest request) {
        Chat groupChat = new Chat();
        groupChat.setType(ChatType.GROUP);
        groupChat.setName(request.getName().trim());
        groupChat.setDescription(request.getDescription());
        groupChat.setImage(request.getImage());
        groupChat.setCreatedBy(currentUser);
        groupChat.setCreatedAt(LocalDateTime.now());
        groupChat.setUpdatedAt(LocalDateTime.now());

        Chat savedChat = chatRepository.save(groupChat);

        // Add creator as ADMIN
        GroupMember adminMember = new GroupMember(savedChat, currentUser, GroupRole.ADMIN);
        groupMemberRepository.save(adminMember);
        savedChat.getMembers().add(adminMember);

        // Add other members
        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                if (!memberId.equals(currentUser.getId())) {
                    userRepository.findById(memberId).ifPresent(user -> {
                        GroupMember member = new GroupMember(savedChat, user, GroupRole.MEMBER);
                        groupMemberRepository.save(member);
                        savedChat.getMembers().add(member);
                    });
                }
            }
        }

        // Notify all members in real-time
        notifyChatMembers(savedChat);

        return toDto(savedChat, currentUser);
    }

    @Transactional
    public ChatDto updateGroupChat(User currentUser, Long chatId, UpdateGroupRequest request) {
        Chat chat = getChatEntity(chatId);
        if (chat.getType() != ChatType.GROUP) {
            throw new BadRequestException("Only group chats can be updated");
        }

        GroupMember currentMember = groupMemberRepository.findByChatIdAndUserId(chatId, currentUser.getId())
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));

        if (currentMember.getRole() != GroupRole.ADMIN) {
            throw new UnauthorizedException("Only group admins can update group settings");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            chat.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            chat.setDescription(request.getDescription().trim());
        }
        if (request.getImage() != null) {
            chat.setImage(request.getImage().trim());
        }

        if (request.getAddMemberIds() != null) {
            for (Long memberId : request.getAddMemberIds()) {
                if (!groupMemberRepository.existsByChatIdAndUserId(chatId, memberId)) {
                    userRepository.findById(memberId).ifPresent(user -> {
                        GroupMember newMem = new GroupMember(chat, user, GroupRole.MEMBER);
                        groupMemberRepository.save(newMem);
                        chat.getMembers().add(newMem);
                    });
                }
            }
        }

        if (request.getRemoveMemberIds() != null) {
            for (Long memberId : request.getRemoveMemberIds()) {
                if (!memberId.equals(currentUser.getId())) {
                    groupMemberRepository.deleteByChatIdAndUserId(chatId, memberId);
                    chat.getMembers().removeIf(m -> m.getUser().getId().equals(memberId));
                }
            }
        }

        chat.setUpdatedAt(LocalDateTime.now());
        Chat updated = chatRepository.save(chat);

        // Notify all members
        notifyChatMembers(updated);

        return toDto(updated, currentUser);
    }

    public void notifyChatMembers(Chat chat) {
        if (chat == null || chat.getMembers() == null) return;
        for (GroupMember member : chat.getMembers()) {
            if (member.getUser() != null) {
                ChatDto memberDto = toDto(chat, member.getUser());
                messagingTemplate.convertAndSend("/topic/user." + member.getUser().getId() + ".chats", memberDto);
            }
        }
    }

    public ChatDto toDto(Chat chat, User currentUser) {
        if (chat == null) return null;

        ChatDto dto = new ChatDto();
        dto.setId(chat.getId());
        dto.setType(chat.getType());
        dto.setDescription(chat.getDescription());
        dto.setCreatedBy(userService.toDto(chat.getCreatedBy()));
        dto.setCreatedAt(chat.getCreatedAt());
        dto.setUpdatedAt(chat.getUpdatedAt());

        // For direct chats, name and image come from the other participant
        if (chat.getType() == ChatType.DIRECT) {
            Optional<GroupMember> otherMember = chat.getMembers().stream()
                    .filter(m -> !m.getUser().getId().equals(currentUser.getId()))
                    .findFirst();

            if (otherMember.isPresent()) {
                User otherUser = otherMember.get().getUser();
                dto.setName(otherUser.getDisplayName() != null ? otherUser.getDisplayName() : otherUser.getUsername());
                dto.setImage(otherUser.getAvatarUrl());
            } else {
                dto.setName("Chat");
            }
        } else {
            dto.setName(chat.getName());
            dto.setImage(chat.getImage());
        }

        // Map members
        List<GroupMemberDto> memberDtos = chat.getMembers().stream()
                .map(m -> new GroupMemberDto(
                        m.getId(),
                        userService.toDto(m.getUser()),
                        m.getRole(),
                        m.getJoinedAt()
                ))
                .collect(Collectors.toList());
        dto.setMembers(memberDtos);

        // Map last message
        if (chat.getLastMessage() != null) {
            dto.setLastMessage(messageService.toDto(chat.getLastMessage()));
        }

        // Compute unread count
        long unread = messageRepository.countUnreadMessages(chat.getId(), currentUser.getId());
        dto.setUnreadCount(unread);

        return dto;
    }
}
