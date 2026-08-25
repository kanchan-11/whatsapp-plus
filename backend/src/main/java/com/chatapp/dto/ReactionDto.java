package com.chatapp.dto;

import java.util.ArrayList;
import java.util.List;

public class ReactionDto {
    private String emoji;
    private int count;
    private List<UserDto> users = new ArrayList<>();
    private boolean reactedByMe;

    public ReactionDto() {}

    public ReactionDto(String emoji, int count, List<UserDto> users, boolean reactedByMe) {
        this.emoji = emoji;
        this.count = count;
        this.users = users;
        this.reactedByMe = reactedByMe;
    }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public List<UserDto> getUsers() { return users; }
    public void setUsers(List<UserDto> users) { this.users = users; }

    public boolean isReactedByMe() { return reactedByMe; }
    public void setReactedByMe(boolean reactedByMe) { this.reactedByMe = reactedByMe; }
}
