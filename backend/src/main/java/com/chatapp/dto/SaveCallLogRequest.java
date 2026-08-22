package com.chatapp.dto;

import com.chatapp.model.enums.CallStatus;
import com.chatapp.model.enums.CallType;
import jakarta.validation.constraints.NotNull;

public class SaveCallLogRequest {
    @NotNull
    private Long partnerId;

    @NotNull
    private CallType callType;

    @NotNull
    private CallStatus status;

    private boolean isOutgoing = true;

    private Integer durationSeconds = 0;

    public SaveCallLogRequest() {}

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
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

    public boolean isOutgoing() {
        return isOutgoing;
    }

    public void setOutgoing(boolean outgoing) {
        isOutgoing = outgoing;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
}
