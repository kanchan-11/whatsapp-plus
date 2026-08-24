package com.chatapp.dto;

import jakarta.validation.constraints.NotBlank;

public class GithubOAuthRequest {

    @NotBlank(message = "OAuth code is required")
    private String code;

    private String redirectUri;

    public GithubOAuthRequest() {
    }

    public GithubOAuthRequest(String code, String redirectUri) {
        this.code = code;
        this.redirectUri = redirectUri;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }
}
