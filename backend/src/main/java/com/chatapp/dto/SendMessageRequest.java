package com.chatapp.dto;

import com.chatapp.model.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class SendMessageRequest {

    @NotNull(message = "Chat ID is required")
    private Long chatId;

    private String content;

    private MessageType type = MessageType.TEXT;

    private List<AttachmentDto> attachments = new ArrayList<>();

    private Long replyToId;

    public SendMessageRequest() {}

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public List<AttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDto> attachments) { this.attachments = attachments; }

    public Long getReplyToId() { return replyToId; }
    public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }
}
