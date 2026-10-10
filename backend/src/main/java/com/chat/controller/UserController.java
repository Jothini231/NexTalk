package com.chat.controller;

import com.chat.dto.UpdateProfileRequest;
import com.chat.dto.UserDTO;
import com.chat.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String query) {
        List<UserDTO> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDTO user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDTO user = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Boolean> request) {
        boolean online = request.getOrDefault("online", false);
        userService.updateOnlineStatus(userDetails.getUsername(), online);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }
}
