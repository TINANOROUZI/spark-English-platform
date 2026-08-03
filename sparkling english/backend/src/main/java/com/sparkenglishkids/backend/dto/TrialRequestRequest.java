package com.sparkenglishkids.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrialRequestRequest {

    @NotBlank(message = "Parent name is required")
    private String parentName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @Min(value = 3, message = "Child age must be at least 3")
    @Max(value = 18, message = "Child age must be at most 18")
    private Integer childAge;

    private String preferredTime;

    private String notes;
}
