package com.chatapp.controller;

import com.chatapp.dto.ActiveGroupCallDto;
import com.chatapp.dto.SignalMessage;
import com.chatapp.model.Chat;
import com.chatapp.model.GroupMember;
import com.chatapp.model.enums.CallSignalType;
import com.chatapp.repository.ChatRepository;
import com.chatapp.service.ActiveGroupCallService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
public class CallSignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository chatRepository;
    private final ActiveGroupCallService activeGroupCallService;

    public CallSignalingController(
            SimpMessagingTemplate messagingTemplate,
            ChatRepository chatRepository,
            ActiveGroupCallService activeGroupCallService
    ) {
        this.messagingTemplate = messagingTemplate;
        this.chatRepository = chatRepository;
        this.activeGroupCallService = activeGroupCallService;
    }

    /**
     * Route WebRTC signaling messages (CALL_REQUEST, CALL_ACCEPT, CALL_REJECT, CALL_END, OFFER, ANSWER, ICE_CANDIDATE, GROUP_CALL_START, GROUP_CALL_JOIN, GROUP_CALL_LEAVE)
     * to the intended receiver(s) and track active group call state.
     */
    @MessageMapping("/call.signal")
    public void handleCallSignal(@Payload SignalMessage signal) {
        if (signal == null) return;

        // 1. Group Call Start
        if (signal.getSignalType() == CallSignalType.GROUP_CALL_START && signal.getChatId() != null) {
            ActiveGroupCallDto activeCall = activeGroupCallService.startGroupCall(signal);

            // Fan-out incoming ringing call alert to all members of the group
            Optional<Chat> chatOpt = chatRepository.findById(signal.getChatId());
            if (chatOpt.isPresent()) {
                Chat chat = chatOpt.get();
                for (GroupMember member : chat.getMembers()) {
                    if (member.getUser() != null && !member.getUser().getId().equals(signal.getSenderId())) {
                        messagingTemplate.convertAndSend("/topic/call." + member.getUser().getId(), signal);
                    }
                }
            }

            // Broadcast group call update to the group and global topics
            messagingTemplate.convertAndSend("/topic/chat." + signal.getChatId() + ".call", signal);
            messagingTemplate.convertAndSend("/topic/group-calls", activeCall);
            return;
        }

        // 2. Group Call Join
        if (signal.getSignalType() == CallSignalType.GROUP_CALL_JOIN && signal.getChatId() != null) {
            ActiveGroupCallDto activeCall = activeGroupCallService.joinGroupCall(signal);
            messagingTemplate.convertAndSend("/topic/chat." + signal.getChatId() + ".call", signal);
            if (activeCall != null) {
                messagingTemplate.convertAndSend("/topic/group-calls", activeCall);
            }
            return;
        }

        // 3. Group Call Leave
        if (signal.getSignalType() == CallSignalType.GROUP_CALL_LEAVE && signal.getChatId() != null) {
            ActiveGroupCallDto activeCall = activeGroupCallService.leaveGroupCall(signal);
            messagingTemplate.convertAndSend("/topic/chat." + signal.getChatId() + ".call", signal);
            if (activeCall != null) {
                messagingTemplate.convertAndSend("/topic/group-calls", activeCall);
            } else {
                // All participants left -> broadcast ended state
                ActiveGroupCallDto endedCall = new ActiveGroupCallDto();
                endedCall.setChatId(signal.getChatId());
                endedCall.setCallId(signal.getCallId());
                endedCall.setParticipantIds(java.util.Collections.emptySet());
                messagingTemplate.convertAndSend("/topic/group-calls", endedCall);
            }
            return;
        }

        // 4. Direct peer negotiation (OFFER, ANSWER, ICE_CANDIDATE, 1-on-1 CALL_REQUEST/ACCEPT/REJECT)
        if (signal.getTargetUserId() != null) {
            messagingTemplate.convertAndSend("/topic/call." + signal.getTargetUserId(), signal);
        }
        if (signal.getReceiverId() != null) {
            messagingTemplate.convertAndSend("/topic/call." + signal.getReceiverId(), signal);
        }
        if (signal.getChatId() != null) {
            messagingTemplate.convertAndSend("/topic/chat." + signal.getChatId() + ".call", signal);
        }
    }
}
