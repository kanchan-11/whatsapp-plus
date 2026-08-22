package com.chatapp.dto;

import com.chatapp.model.enums.GroupRole;
import java.time.LocalDateTime;

public class GroupMemberDto {
    private Long id;
    private UserDto user;
    private GroupRole role;
    private LocalDateTime joinedAt;

    public GroupMemberDto() {}

    public GroupMemberDto(Long id, UserDto user, GroupRole role, LocalDateTime joinedAt) {
        this.id = id;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public GroupRole getRole() { return role; }
    public void setRole(GroupRole role) { this.role = role; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
