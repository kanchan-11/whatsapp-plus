package com.chatapp.dto;

import com.chatapp.model.enums.CallType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ActiveGroupCallDto {
    private String callId;
    private Long chatId;
    private String groupName;
    private String groupImage;
    private CallType callType;
    private Long callerId;
    private String callerName;
    private String callerAvatar;
    private Set<Long> participantIds = new HashSet<>();
    private List<UserDto> participants = new ArrayList<>();
    private LocalDateTime startedAt = LocalDateTime.now();

    public ActiveGroupCallDto() {}

    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getGroupImage() { return groupImage; }
    public void setGroupImage(String groupImage) { this.groupImage = groupImage; }

    public CallType getCallType() { return callType; }
    public void setCallType(CallType callType) { this.callType = callType; }

    public Long getCallerId() { return callerId; }
    public void setCallerId(Long callerId) { this.callerId = callerId; }

    public String getCallerName() { return callerName; }
    public void setCallerName(String callerName) { this.callerName = callerName; }

    public String getCallerAvatar() { return callerAvatar; }
    public void setCallerAvatar(String callerAvatar) { this.callerAvatar = callerAvatar; }

    public Set<Long> getParticipantIds() { return participantIds; }
    public void setParticipantIds(Set<Long> participantIds) { this.participantIds = participantIds; }

    public List<UserDto> getParticipants() { return participants; }
    public void setParticipants(List<UserDto> participants) { this.participants = participants; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
}
