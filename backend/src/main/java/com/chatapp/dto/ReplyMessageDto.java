package com.chatapp.dto;

import com.chatapp.model.enums.MessageType;

public class ReplyMessageDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private String content;
    private MessageType type;

    public ReplyMessageDto() {}

    public ReplyMessageDto(Long id, Long senderId, String senderName, String content, MessageType type) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.type = type;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
}
