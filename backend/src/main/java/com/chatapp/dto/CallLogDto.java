package com.chatapp.dto;

import com.chatapp.model.enums.CallStatus;
import com.chatapp.model.enums.CallType;
import java.time.LocalDateTime;

public class CallLogDto {
    private Long id;
    private UserDto caller;
    private UserDto receiver;
    private UserDto partner; // The other user in the call relative to current user
    private boolean isOutgoing;
    private CallType callType;
    private CallStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;

    public CallLogDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDto getCaller() {
        return caller;
    }

    public void setCaller(UserDto caller) {
        this.caller = caller;
    }

    public UserDto getReceiver() {
        return receiver;
    }

    public void setReceiver(UserDto receiver) {
        this.receiver = receiver;
    }

    public UserDto getPartner() {
        return partner;
    }

    public void setPartner(UserDto partner) {
        this.partner = partner;
    }

    public boolean isOutgoing() {
        return isOutgoing;
    }

    public void setOutgoing(boolean outgoing) {
        isOutgoing = outgoing;
    }

    public CallType getCallType() {
        return callType;
    }

    public void setCallType(CallType callType) {
        this.callType = callType;
    }

    public CallStatus getStatus() {
        return status;
    }

    public void setStatus(CallStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
}
