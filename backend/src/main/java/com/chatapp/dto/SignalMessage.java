package com.chatapp.dto;

import com.chatapp.model.enums.CallSignalType;
import com.chatapp.model.enums.CallType;

public class SignalMessage {
    private String callId;
    private CallSignalType signalType;
    private CallType callType; // AUDIO or VIDEO
    private Long senderId;
    private String senderUsername;
    private String senderName;
    private String senderAvatar;
    private Long receiverId;
    private Long targetUserId;
    private Long chatId;
    private boolean isGroup;
    private String groupName;
    private String groupImage;
    private Object data; // SDP offer/answer or ICE candidate object

    public SignalMessage() {}

    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }

    public CallSignalType getSignalType() { return signalType; }
    public void setSignalType(CallSignalType signalType) { this.signalType = signalType; }

    public CallType getCallType() { return callType; }
    public void setCallType(CallType callType) { this.callType = callType; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderAvatar() { return senderAvatar; }
    public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public boolean isGroup() { return isGroup; }
    public void setGroup(boolean group) { isGroup = group; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getGroupImage() { return groupImage; }
    public void setGroupImage(String groupImage) { this.groupImage = groupImage; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}
