package com.chatapp.dto;

import jakarta.validation.constraints.NotBlank;

public class ReactionRequest {

    @NotBlank(message = "Emoji is required")
    private String emoji;

    public ReactionRequest() {}

    public ReactionRequest(String emoji) {
        this.emoji = emoji;
    }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
}
