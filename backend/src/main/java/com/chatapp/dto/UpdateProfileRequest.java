package com.chatapp.dto;

public class UpdateProfileRequest {
    private String displayName;
    private String statusBio;
    private String avatarUrl;

    public UpdateProfileRequest() {}

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getStatusBio() { return statusBio; }
    public void setStatusBio(String statusBio) { this.statusBio = statusBio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
