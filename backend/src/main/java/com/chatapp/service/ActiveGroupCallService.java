package com.chatapp.service;

import com.chatapp.dto.ActiveGroupCallDto;
import com.chatapp.dto.SignalMessage;
import com.chatapp.dto.UserDto;
import com.chatapp.model.enums.CallType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ActiveGroupCallService {

    // Map: chatId -> ActiveGroupCallDto
    private final Map<Long, ActiveGroupCallDto> activeCalls = new ConcurrentHashMap<>();

    public ActiveGroupCallDto startGroupCall(SignalMessage signal) {
        if (signal.getChatId() == null) return null;

        ActiveGroupCallDto call = new ActiveGroupCallDto();
        call.setCallId(signal.getCallId());
        call.setChatId(signal.getChatId());
        call.setGroupName(signal.getGroupName());
        call.setGroupImage(signal.getGroupImage());
        call.setCallType(signal.getCallType() != null ? signal.getCallType() : CallType.VIDEO);
        call.setCallerId(signal.getSenderId());
        call.setCallerName(signal.getSenderName() != null ? signal.getSenderName() : signal.getSenderUsername());
        call.setCallerAvatar(signal.getSenderAvatar());
        call.setStartedAt(LocalDateTime.now());

        if (signal.getSenderId() != null) {
            call.getParticipantIds().add(signal.getSenderId());
            UserDto u = new UserDto();
            u.setId(signal.getSenderId());
            u.setUsername(signal.getSenderUsername());
            u.setDisplayName(signal.getSenderName() != null ? signal.getSenderName() : signal.getSenderUsername());
            u.setAvatarUrl(signal.getSenderAvatar());
            call.getParticipants().add(u);
        }

        activeCalls.put(signal.getChatId(), call);
        return call;
    }

    public ActiveGroupCallDto joinGroupCall(SignalMessage signal) {
        if (signal.getChatId() == null) return null;
        ActiveGroupCallDto call = activeCalls.get(signal.getChatId());
        if (call == null) {
            return startGroupCall(signal);
        }

        if (signal.getSenderId() != null && !call.getParticipantIds().contains(signal.getSenderId())) {
            call.getParticipantIds().add(signal.getSenderId());
            UserDto u = new UserDto();
            u.setId(signal.getSenderId());
            u.setUsername(signal.getSenderUsername());
            u.setDisplayName(signal.getSenderName() != null ? signal.getSenderName() : signal.getSenderUsername());
            u.setAvatarUrl(signal.getSenderAvatar());
            call.getParticipants().add(u);
        }
        return call;
    }

    public ActiveGroupCallDto leaveGroupCall(SignalMessage signal) {
        if (signal.getChatId() == null) return null;
        ActiveGroupCallDto call = activeCalls.get(signal.getChatId());
        if (call == null) return null;

        if (signal.getSenderId() != null) {
            call.getParticipantIds().remove(signal.getSenderId());
            call.getParticipants().removeIf(p -> p.getId().equals(signal.getSenderId()));
        }

        if (call.getParticipantIds().isEmpty()) {
            activeCalls.remove(signal.getChatId());
            return null;
        }

        return call;
    }

    public Optional<ActiveGroupCallDto> getActiveCall(Long chatId) {
        return Optional.ofNullable(activeCalls.get(chatId));
    }

    public List<ActiveGroupCallDto> getAllActiveCalls() {
        return new ArrayList<>(activeCalls.values());
    }

    public void removeCall(Long chatId) {
        activeCalls.remove(chatId);
    }
}
