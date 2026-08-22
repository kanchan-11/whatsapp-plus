package com.chatapp.dto;

import jakarta.validation.constraints.NotNull;

public class CreateDirectChatRequest {

    @NotNull(message = "Target user ID is required")
    private Long targetUserId;

    public CreateDirectChatRequest() {}

    public CreateDirectChatRequest(Long targetUserId) {
        this.targetUserId = targetUserId;
    }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }
}
