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
    private final com.chatapp.repository.UserRepository userRepository;

    // In-memory fallback if Redis is unreachable
    private final Map<Long, Long> localPresence = new ConcurrentHashMap<>();
    private final Map<Long, LocalDateTime> localLastSeen = new ConcurrentHashMap<>();

    public PresenceService(
            RedisTemplate<String, Object> redisTemplate,
            SimpMessagingTemplate messagingTemplate,
            com.chatapp.repository.UserRepository userRepository
    ) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    public void markOnline(Long userId, String username) {
        if (userId == null) return;

        localPresence.put(userId, System.currentTimeMillis() + TTL.toMillis());
        try {
            redisTemplate.opsForValue().set(PRESENCE_KEY_PREFIX + userId, "ONLINE", TTL);
        } catch (Exception e) {
            log.debug("Redis unavailable, using local presence store: {}", e.getMessage());
        }

        try {
            userRepository.findById(userId).ifPresent(u -> {
                u.setOnline(true);
                userRepository.save(u);
            });
        } catch (Exception e) {
            log.warn("Failed to persist user online flag", e);
        }

        broadcastPresence(userId, username, true, LocalDateTime.now());
    }

    public void heartbeat(Long userId, String username) {
        if (userId == null) return;

        localPresence.put(userId, System.currentTimeMillis() + TTL.toMillis());
        try {
            redisTemplate.opsForValue().set(PRESENCE_KEY_PREFIX + userId, "ONLINE", TTL);
        } catch (Exception e) {
            // Keep localPresence active
        }
    }

    public void markOffline(Long userId, String username) {
        if (userId == null) return;

        LocalDateTime now = LocalDateTime.now();
        localPresence.remove(userId);
        localLastSeen.put(userId, now);

        try {
            redisTemplate.delete(PRESENCE_KEY_PREFIX + userId);
            redisTemplate.opsForValue().set(LAST_SEEN_KEY_PREFIX + userId, now.toString(), Duration.ofDays(30));
        } catch (Exception e) {
            // Local store updated
        }

        try {
            userRepository.findById(userId).ifPresent(u -> {
                u.setOnline(false);
                u.setLastSeen(now);
                userRepository.save(u);
            });
        } catch (Exception e) {
            log.warn("Failed to persist user offline flag", e);
        }

        broadcastPresence(userId, username, false, now);
    }

    public boolean isUserOnline(Long userId) {
        if (userId == null) return false;

        Long expiry = localPresence.get(userId);
        if (expiry != null && expiry > System.currentTimeMillis()) {
            return true;
        }

        try {
            if (Boolean.TRUE.equals(redisTemplate.hasKey(PRESENCE_KEY_PREFIX + userId))) {
                return true;
            }
        } catch (Exception e) {
            // Fall through to DB
        }

        return userRepository.findById(userId).map(com.chatapp.model.User::isOnline).orElse(false);
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
