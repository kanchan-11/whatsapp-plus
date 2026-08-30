package com.chatapp.service;

import com.chatapp.dto.UserPresenceDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private static final Logger log = LoggerFactory.getLogger(PresenceService.class);
    private static final String PRESENCE_KEY_PREFIX = "presence:user:";
    private static final String LAST_SEEN_KEY_PREFIX = "presence:lastseen:";
    private static final Duration TTL = Duration.ofSeconds(45);

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    // In-memory fallback if Redis is unreachable
    private final Map<Long, Long> localPresence = new ConcurrentHashMap<>();
    private final Map<Long, LocalDateTime> localLastSeen = new ConcurrentHashMap<>();

    public PresenceService(RedisTemplate<String, Object> redisTemplate, SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    public void markOnline(Long userId, String username) {
        if (userId == null) return;

        try {
            redisTemplate.opsForValue().set(PRESENCE_KEY_PREFIX + userId, "ONLINE", TTL);
        } catch (Exception e) {
            log.debug("Redis unavailable, using local presence store: {}", e.getMessage());
            localPresence.put(userId, System.currentTimeMillis() + TTL.toMillis());
        }

        broadcastPresence(userId, username, true, LocalDateTime.now());
    }

    public void heartbeat(Long userId, String username) {
        if (userId == null) return;

        try {
            redisTemplate.opsForValue().set(PRESENCE_KEY_PREFIX + userId, "ONLINE", TTL);
        } catch (Exception e) {
            localPresence.put(userId, System.currentTimeMillis() + TTL.toMillis());
        }
    }

    public void markOffline(Long userId, String username) {
        if (userId == null) return;

        LocalDateTime now = LocalDateTime.now();
        try {
            redisTemplate.delete(PRESENCE_KEY_PREFIX + userId);
            redisTemplate.opsForValue().set(LAST_SEEN_KEY_PREFIX + userId, now.toString(), Duration.ofDays(30));
        } catch (Exception e) {
            localPresence.remove(userId);
            localLastSeen.put(userId, now);
        }

        broadcastPresence(userId, username, false, now);
    }

    public boolean isUserOnline(Long userId) {
        if (userId == null) return false;

        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(PRESENCE_KEY_PREFIX + userId));
        } catch (Exception e) {
            Long expiry = localPresence.get(userId);
            if (expiry != null && expiry > System.currentTimeMillis()) {
                return true;
            }
            localPresence.remove(userId);
            return false;
        }
    }

    public UserPresenceDto getUserPresence(Long userId, String username) {
        boolean online = isUserOnline(userId);
        LocalDateTime lastSeen = null;

        if (!online) {
            try {
                Object val = redisTemplate.opsForValue().get(LAST_SEEN_KEY_PREFIX + userId);
                if (val != null) {
                    lastSeen = LocalDateTime.parse(val.toString());
                }
            } catch (Exception e) {
                lastSeen = localLastSeen.get(userId);
            }
        }

        return new UserPresenceDto(userId, username, online, lastSeen);
    }

    private void broadcastPresence(Long userId, String username, boolean isOnline, LocalDateTime lastSeen) {
        UserPresenceDto dto = new UserPresenceDto(userId, username, isOnline, lastSeen);
        try {
            messagingTemplate.convertAndSend("/topic/presence", dto);
        } catch (Exception e) {
            log.error("Failed to broadcast presence update: {}", e.getMessage());
        }
    }
}
