package com.chat.service;

import com.chat.dto.UpdateProfileRequest;
import com.chat.dto.UserDTO;
import com.chat.entity.User;
import com.chat.exception.ResourceNotFoundException;
import com.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDTO(user);
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return mapToDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        return mapToDTO(userRepository.save(user));
    }

    @Transactional
    public void updateOnlineStatus(String username, boolean online) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setOnline(online);
            userRepository.save(user);
        });
    }

    public List<UserDTO> searchUsers(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return userRepository
                .findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .isOnline(user.isOnline())
                .lastSeen(user.getLastSeen())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
