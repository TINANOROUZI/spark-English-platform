package com.sparkenglishkids.backend.dto;

import com.sparkenglishkids.backend.model.ContactMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class ContactMessageResponse {
    private Long id;
    private String name;
    private String email;
    private String message;
    private String submittedByEmail;
    private Instant createdAt;

    public static ContactMessageResponse from(ContactMessage cm) {
        return ContactMessageResponse.builder()
                .id(cm.getId())
                .name(cm.getName())
                .email(cm.getEmail())
                .message(cm.getMessage())
                .submittedByEmail(cm.getUser() != null ? cm.getUser().getEmail() : null)
                .createdAt(cm.getCreatedAt())
                .build();
    }
}
