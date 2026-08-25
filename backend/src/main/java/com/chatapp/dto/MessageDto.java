package com.chatapp.dto;

import com.chatapp.model.enums.MessageStatus;
import com.chatapp.model.enums.MessageType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MessageDto {
    private Long id;
    private Long chatId;
    private UserDto sender;
    private String content;
    private MessageType type;
    private MessageStatus status;
    private List<AttachmentDto> attachments = new ArrayList<>();
    private List<ReactionDto> reactions = new ArrayList<>();
    private ReplyMessageDto replyTo;
    private LocalDateTime createdAt;

    public MessageDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public UserDto getSender() { return sender; }
    public void setSender(UserDto sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }

    public List<AttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDto> attachments) { this.attachments = attachments; }

    public List<ReactionDto> getReactions() { return reactions; }
    public void setReactions(List<ReactionDto> reactions) { this.reactions = reactions; }

    public ReplyMessageDto getReplyTo() { return replyTo; }
    public void setReplyTo(ReplyMessageDto replyTo) { this.replyTo = replyTo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
