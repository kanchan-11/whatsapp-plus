package com.chatapp.dto;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String statusBio;
    private boolean isOnline;
    private LocalDateTime lastSeen;

    public UserDto() {}

    public UserDto(Long id, String username, String email, String displayName, String avatarUrl, String statusBio, boolean isOnline, LocalDateTime lastSeen) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.statusBio = statusBio;
        this.isOnline = isOnline;
        this.lastSeen = lastSeen;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getStatusBio() { return statusBio; }
    public void setStatusBio(String statusBio) { this.statusBio = statusBio; }

    @com.fasterxml.jackson.annotation.JsonProperty("isOnline")
    public boolean isOnline() { return isOnline; }

    @com.fasterxml.jackson.annotation.JsonProperty("isOnline")
    public void setOnline(boolean online) { isOnline = online; }

    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
}
