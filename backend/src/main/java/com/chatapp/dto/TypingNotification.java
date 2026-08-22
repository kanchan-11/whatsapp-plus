package com.chatapp.dto;

public class TypingNotification {
    private Long chatId;
    private Long userId;
    private String username;
    private String displayName;
    private boolean typing;

    public TypingNotification() {}

    public TypingNotification(Long chatId, Long userId, String username, String displayName, boolean typing) {
        this.chatId = chatId;
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.typing = typing;
    }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public boolean isTyping() { return typing; }
    public void setTyping(boolean typing) { this.typing = typing; }
}
