package com.chatapp.service;

import com.chatapp.dto.AuthRequest;
import com.chatapp.dto.AuthResponse;
import com.chatapp.dto.RegisterRequest;
import com.chatapp.dto.UpdateProfileRequest;
import com.chatapp.dto.UserDto;
import com.chatapp.exception.BadRequestException;
import com.chatapp.exception.ResourceNotFoundException;
import com.chatapp.exception.UnauthorizedException;
import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @org.springframework.beans.factory.annotation.Value("${app.oauth.github.client-id:}")
    private String githubClientId;

    @org.springframework.beans.factory.annotation.Value("${app.oauth.github.client-secret:}")
    private String githubClientSecret;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim().toLowerCase());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName() != null && !request.getDisplayName().isBlank() 
                ? request.getDisplayName().trim() 
                : request.getUsername());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setOnline(true);
        user.setLastSeen(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser.getUsername(), savedUser.getId());

        return new AuthResponse(token, toDto(savedUser));
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        User user = userRepository.findByUsernameOrEmail(identifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid username/email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username/email or password");
        }

        user.setOnline(true);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), user.getId());
        return new AuthResponse(token, toDto(user));
    }

    @Transactional
    public AuthResponse socialLogin(com.chatapp.dto.SocialLoginRequest request) {
        String email = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail().trim().toLowerCase()
                : null;

        String rawName = request.getName() != null && !request.getName().isBlank()
                ? request.getName().trim()
                : (email != null && email.contains("@") ? email.substring(0, email.indexOf('@')) : request.getProvider() + "_user");

        String baseUsername;
        if (email != null && email.contains("@")) {
            baseUsername = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9_]", "");
        } else {
            baseUsername = rawName.toLowerCase().replaceAll("[^a-zA-Z0-9_]", "");
        }
        if (baseUsername.isBlank()) {
            baseUsername = request.getProvider().toLowerCase() + "_user";
        }

        User user = null;
        if (email != null) {
            user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByUsernameIgnoreCase(baseUsername).orElse(null);
        }

        if (user == null) {
            // Create new social user
            user = new User();
            String uniqueUsername = baseUsername;
            int counter = 1;
            while (userRepository.existsByUsernameIgnoreCase(uniqueUsername)) {
                uniqueUsername = baseUsername + counter++;
            }

            String uniqueEmail = email;
            if (uniqueEmail == null || uniqueEmail.isBlank()) {
                uniqueEmail = uniqueUsername.toLowerCase() + "@" + request.getProvider().toLowerCase() + ".oauth";
                int emailCounter = 1;
                while (userRepository.existsByEmailIgnoreCase(uniqueEmail)) {
                    uniqueEmail = uniqueUsername.toLowerCase() + emailCounter++ + "@" + request.getProvider().toLowerCase() + ".oauth";
                }
            }

            user.setUsername(uniqueUsername);
            user.setEmail(uniqueEmail);
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            user.setDisplayName(rawName);
            user.setAvatarUrl(request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()
                    ? request.getAvatarUrl()
                    : "https://api.dicebear.com/7.x/bottts/svg?seed=" + uniqueUsername);
            user.setOnline(true);
            user.setLastSeen(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            // Existing user update
            if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
                user.setAvatarUrl(request.getAvatarUrl());
            }
            user.setDisplayName(rawName);
            user.setOnline(true);
            user.setLastSeen(LocalDateTime.now());
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getUsername(), user.getId());
        return new AuthResponse(token, toDto(user));
    }

    @Transactional
    public AuthResponse githubOAuthLogin(com.chatapp.dto.GithubOAuthRequest request) {
        if (githubClientSecret == null || githubClientSecret.isBlank()) {
            throw new BadRequestException("GitHub OAuth Client Secret is not configured on the backend. Please set GITHUB_CLIENT_SECRET in your backend environment or application.yml.");
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            // 1. Exchange code for access token
            org.springframework.http.HttpHeaders tokenHeaders = new org.springframework.http.HttpHeaders();
            tokenHeaders.setAccept(java.util.List.of(org.springframework.http.MediaType.APPLICATION_JSON));
            tokenHeaders.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            java.util.Map<String, String> tokenBody = new java.util.HashMap<>();
            tokenBody.put("client_id", githubClientId);
            tokenBody.put("client_secret", githubClientSecret);
            tokenBody.put("code", request.getCode());
            if (request.getRedirectUri() != null) {
                tokenBody.put("redirect_uri", request.getRedirectUri());
            }

            org.springframework.http.HttpEntity<java.util.Map<String, String>> tokenEntity = 
                    new org.springframework.http.HttpEntity<>(tokenBody, tokenHeaders);

            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> tokenRes = restTemplate.postForObject(
                    "https://github.com/login/oauth/access_token",
                    tokenEntity,
                    java.util.Map.class
            );

            if (tokenRes == null || !tokenRes.containsKey("access_token")) {
                String errorDesc = tokenRes != null && tokenRes.containsKey("error_description") 
                        ? (String) tokenRes.get("error_description") 
                        : "Failed to exchange GitHub authorization code";
                throw new BadRequestException(errorDesc);
            }

            String accessToken = (String) tokenRes.get("access_token");

            // 2. Fetch user profile from GitHub API
            org.springframework.http.HttpHeaders userHeaders = new org.springframework.http.HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            userHeaders.set("User-Agent", "InstantPing-App");
            org.springframework.http.HttpEntity<Void> userEntity = new org.springframework.http.HttpEntity<>(userHeaders);

            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> githubUser = restTemplate.exchange(
                    "https://api.github.com/user",
                    org.springframework.http.HttpMethod.GET,
                    userEntity,
                    java.util.Map.class
            ).getBody();

            if (githubUser == null) {
                throw new BadRequestException("Could not retrieve GitHub user profile");
            }

            String login = (String) githubUser.get("login");
            String name = (String) githubUser.get("name");
            String email = (String) githubUser.get("email");
            String avatarUrl = (String) githubUser.get("avatar_url");
            Object idObj = githubUser.get("id");
            String providerId = idObj != null ? String.valueOf(idObj) : String.valueOf(System.currentTimeMillis());

            // 3. If primary email is private, fetch from /user/emails
            if (email == null || email.isBlank()) {
                try {
                    @SuppressWarnings("rawtypes")
                    org.springframework.http.ResponseEntity<java.util.List> emailsRes = restTemplate.exchange(
                            "https://api.github.com/user/emails",
                            org.springframework.http.HttpMethod.GET,
                            userEntity,
                            java.util.List.class
                    );
                    if (emailsRes.getBody() != null) {
                        for (Object o : emailsRes.getBody()) {
                            if (o instanceof java.util.Map) {
                                @SuppressWarnings("unchecked")
                                java.util.Map<String, Object> emailMap = (java.util.Map<String, Object>) o;
                                Boolean primary = (Boolean) emailMap.get("primary");
                                if (Boolean.TRUE.equals(primary)) {
                                    email = (String) emailMap.get("email");
                                    break;
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            if (email == null || email.isBlank()) {
                email = login.toLowerCase() + "@github.oauth";
            }

            com.chatapp.dto.SocialLoginRequest socialReq = new com.chatapp.dto.SocialLoginRequest(
                    "github",
                    email,
                    name != null && !name.isBlank() ? name : login,
                    avatarUrl,
                    providerId
            );

            return socialLogin(socialReq);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("GitHub OAuth authentication failed: " + e.getMessage());
        }
    }

    public User getCurrentUserEntity() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            throw new UnauthorizedException("Not authenticated");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public UserDto getCurrentUser() {
        return toDto(getCurrentUserEntity());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toDto(user);
    }

    public List<UserDto> searchUsers(String query) {
        User current = getCurrentUserEntity();
        if (query == null || query.isBlank()) {
            return userRepository.findAllExceptCurrent(current.getId())
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }
        return userRepository.searchUsers(query.trim(), current.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUserEntity();
        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getStatusBio() != null) {
            user.setStatusBio(request.getStatusBio().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        User updated = userRepository.save(user);
        return toDto(updated);
    }

    @Transactional
    public void setOnlineStatus(Long userId, boolean isOnline) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(isOnline);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public UserDto toDto(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getStatusBio(),
                user.isOnline(),
                user.getLastSeen()
        );
    }
}
