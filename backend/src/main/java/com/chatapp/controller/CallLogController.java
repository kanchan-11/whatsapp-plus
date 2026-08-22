package com.chatapp.controller;

import com.chatapp.dto.ActiveGroupCallDto;
import com.chatapp.dto.CallLogDto;
import com.chatapp.dto.SaveCallLogRequest;
import com.chatapp.model.User;
import com.chatapp.service.ActiveGroupCallService;
import com.chatapp.service.CallLogService;
import com.chatapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calls")
public class CallLogController {

    private final CallLogService callLogService;
    private final UserService userService;
    private final ActiveGroupCallService activeGroupCallService;

    public CallLogController(
            CallLogService callLogService,
            UserService userService,
            ActiveGroupCallService activeGroupCallService
    ) {
        this.callLogService = callLogService;
        this.userService = userService;
        this.activeGroupCallService = activeGroupCallService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<CallLogDto>> getCallHistory() {
        User currentUser = userService.getCurrentUserEntity();
        List<CallLogDto> history = callLogService.getUserCallHistory(currentUser);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/log")
    public ResponseEntity<CallLogDto> recordCall(@Valid @RequestBody SaveCallLogRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        CallLogDto log = callLogService.recordCallLog(currentUser, request);
        return ResponseEntity.ok(log);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ActiveGroupCallDto>> getAllActiveCalls() {
        return ResponseEntity.ok(activeGroupCallService.getAllActiveCalls());
    }

    @GetMapping("/active/{chatId}")
    public ResponseEntity<ActiveGroupCallDto> getActiveCallForChat(@PathVariable Long chatId) {
        return activeGroupCallService.getActiveCall(chatId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
