package com.chatapp.dto;

import com.chatapp.model.enums.MessageStatus;
import java.util.List;

public class MessageStatusUpdateDto {
    private Long chatId;
    private List<Long> messageIds;
    private MessageStatus status;
    private Long updatedByUserId;

    public MessageStatusUpdateDto() {}

    public MessageStatusUpdateDto(Long chatId, List<Long> messageIds, MessageStatus status, Long updatedByUserId) {
        this.chatId = chatId;
        this.messageIds = messageIds;
        this.status = status;
        this.updatedByUserId = updatedByUserId;
    }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public List<Long> getMessageIds() { return messageIds; }
    public void setMessageIds(List<Long> messageIds) { this.messageIds = messageIds; }

    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }

    public Long getUpdatedByUserId() { return updatedByUserId; }
    public void setUpdatedByUserId(Long updatedByUserId) { this.updatedByUserId = updatedByUserId; }
}
