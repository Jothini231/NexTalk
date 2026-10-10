package com.chat.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    private String avatarUrl;
}
