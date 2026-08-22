package com.chatapp.dto;

import jakarta.validation.constraints.NotBlank;

public class SocialLoginRequest {

    @NotBlank(message = "Provider is required")
    private String provider; // "google" or "github"

    private String email;

    @NotBlank(message = "Display name is required")
    private String name;

    private String avatarUrl;

    private String providerId;

    public SocialLoginRequest() {
    }

    public SocialLoginRequest(String provider, String email, String name, String avatarUrl, String providerId) {
        this.provider = provider;
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.providerId = providerId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }
}
