package com.chatapp.service;

import com.chatapp.dto.CallLogDto;
import com.chatapp.dto.SaveCallLogRequest;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.model.CallLog;
import com.chatapp.model.User;
import com.chatapp.model.enums.CallStatus;
import com.chatapp.model.enums.CallType;
import com.chatapp.repository.CallLogRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CallLogService {

    private final CallLogRepository callLogRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public CallLogService(
            CallLogRepository callLogRepository,
            UserRepository userRepository,
            UserService userService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.callLogRepository = callLogRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    public List<CallLogDto> getUserCallHistory(User currentUser) {
        List<CallLog> logs = callLogRepository.findCallHistoryByUserId(currentUser.getId());
        return logs.stream()
                .map(log -> toDto(log, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public CallLogDto recordCallLog(User currentUser, SaveCallLogRequest request) {
        User partner = userRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getPartnerId()));

        User caller = request.isOutgoing() ? currentUser : partner;
        User receiver = request.isOutgoing() ? partner : currentUser;

        CallLog log = new CallLog();
        log.setCaller(caller);
        log.setReceiver(receiver);
        log.setCallType(request.getCallType() != null ? request.getCallType() : CallType.AUDIO);
        log.setStatus(request.getStatus() != null ? request.getStatus() : CallStatus.COMPLETED);
        log.setStartedAt(LocalDateTime.now().minusSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 0));
        log.setEndedAt(LocalDateTime.now());
        log.setDurationSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 0);

        CallLog saved = callLogRepository.save(log);

        // Notify both caller and receiver of the new call record in real time
        CallLogDto callerDto = toDto(saved, caller);
        CallLogDto receiverDto = toDto(saved, receiver);

        messagingTemplate.convertAndSend("/topic/user." + caller.getId() + ".calls", callerDto);
        messagingTemplate.convertAndSend("/topic/user." + receiver.getId() + ".calls", receiverDto);

        return toDto(saved, currentUser);
    }

    public CallLogDto toDto(CallLog log, User currentUser) {
        if (log == null) return null;

        CallLogDto dto = new CallLogDto();
        dto.setId(log.getId());
        dto.setCaller(userService.toDto(log.getCaller()));
        dto.setReceiver(userService.toDto(log.getReceiver()));

        boolean isOutgoing = log.getCaller().getId().equals(currentUser.getId());
        dto.setOutgoing(isOutgoing);
        dto.setPartner(isOutgoing ? userService.toDto(log.getReceiver()) : userService.toDto(log.getCaller()));
        dto.setCallType(log.getCallType());
        dto.setStatus(log.getStatus());
        dto.setStartedAt(log.getStartedAt());
        dto.setEndedAt(log.getEndedAt());
        dto.setDurationSeconds(log.getDurationSeconds());

        return dto;
    }
}
