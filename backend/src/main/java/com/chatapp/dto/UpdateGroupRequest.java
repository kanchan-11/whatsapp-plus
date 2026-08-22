package com.chatapp.dto;

import java.util.List;

public class UpdateGroupRequest {
    private String name;
    private String description;
    private String image;
    private List<Long> addMemberIds;
    private List<Long> removeMemberIds;

    public UpdateGroupRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public List<Long> getAddMemberIds() { return addMemberIds; }
    public void setAddMemberIds(List<Long> addMemberIds) { this.addMemberIds = addMemberIds; }

    public List<Long> getRemoveMemberIds() { return removeMemberIds; }
    public void setRemoveMemberIds(List<Long> removeMemberIds) { this.removeMemberIds = removeMemberIds; }
}
