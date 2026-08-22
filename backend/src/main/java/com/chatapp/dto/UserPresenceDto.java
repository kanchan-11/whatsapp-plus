package com.chatapp.dto;

import java.time.LocalDateTime;

public class UserPresenceDto {
    private Long userId;
    private String username;
    private boolean isOnline;
    private LocalDateTime lastSeen;

    public UserPresenceDto() {}

    public UserPresenceDto(Long userId, String username, boolean isOnline, LocalDateTime lastSeen) {
        this.userId = userId;
        this.username = username;
        this.isOnline = isOnline;
        this.lastSeen = lastSeen;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
}
