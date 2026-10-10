package com.chat.service;

import com.chat.dto.AuthResponse;
import com.chat.dto.LoginRequest;
import com.chat.dto.RegisterRequest;
import com.chat.entity.User;
import com.chat.exception.AppException;
import com.chat.repository.UserRepository;
import com.chat.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email '" + request.getEmail() + "' is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .isOnline(true)
                .lastSeen(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getUsername());

        return buildAuthResponse(savedUser, token);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new AppException("User not found"));

        user.setOnline(true);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user, token);
    }

    @Transactional
    public void logout(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setOnline(false);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
