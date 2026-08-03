package com.sparkenglishkids.backend.dto;

import com.sparkenglishkids.backend.model.TrialRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class TrialRequestResponse {
    private Long id;
    private String parentName;
    private String email;
    private Integer childAge;
    private String preferredTime;
    private String notes;
    private String submittedByEmail;
    private Instant createdAt;

    public static TrialRequestResponse from(TrialRequest tr) {
        return TrialRequestResponse.builder()
                .id(tr.getId())
                .parentName(tr.getParentName())
                .email(tr.getEmail())
                .childAge(tr.getChildAge())
                .preferredTime(tr.getPreferredTime())
                .notes(tr.getNotes())
                .submittedByEmail(tr.getUser() != null ? tr.getUser().getEmail() : null)
                .createdAt(tr.getCreatedAt())
                .build();
    }
}
