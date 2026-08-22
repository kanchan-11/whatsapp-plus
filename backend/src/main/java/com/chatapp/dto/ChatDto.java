package com.chatapp.dto;

import com.chatapp.model.enums.ChatType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChatDto {
    private Long id;
    private ChatType type;
    private String name;
    private String description;
    private String image;
    private UserDto createdBy;
    private List<GroupMemberDto> members = new ArrayList<>();
    private MessageDto lastMessage;
    private long unreadCount = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ChatDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ChatType getType() { return type; }
    public void setType(ChatType type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public UserDto getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserDto createdBy) { this.createdBy = createdBy; }

    public List<GroupMemberDto> getMembers() { return members; }
    public void setMembers(List<GroupMemberDto> members) { this.members = members; }

    public MessageDto getLastMessage() { return lastMessage; }
    public void setLastMessage(MessageDto lastMessage) { this.lastMessage = lastMessage; }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
