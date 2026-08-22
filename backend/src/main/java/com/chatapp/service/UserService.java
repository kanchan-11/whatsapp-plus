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
