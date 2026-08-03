package com.sparkenglishkids.backend.controller;

import com.sparkenglishkids.backend.dto.TrialRequestRequest;
import com.sparkenglishkids.backend.dto.TrialRequestResponse;
import com.sparkenglishkids.backend.model.TrialRequest;
import com.sparkenglishkids.backend.model.User;
import com.sparkenglishkids.backend.repository.TrialRequestRepository;
import com.sparkenglishkids.backend.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trial-requests")
public class TrialRequestController {

    private final TrialRequestRepository trialRequestRepository;

    public TrialRequestController(TrialRequestRepository trialRequestRepository) {
        this.trialRequestRepository = trialRequestRepository;
    }

    @PostMapping
    public ResponseEntity<TrialRequestResponse> submit(@Valid @RequestBody TrialRequestRequest request) {
        TrialRequest trialRequest = TrialRequest.builder()
                .parentName(request.getParentName())
                .email(request.getEmail())
                .childAge(request.getChildAge())
                .preferredTime(request.getPreferredTime())
                .notes(request.getNotes())
                .user(CurrentUser.get().orElse(null))
                .build();
        trialRequestRepository.save(trialRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(TrialRequestResponse.from(trialRequest));
    }

    /** Admin-only: enforced by SecurityConfig (GET /api/trial-requests requires ROLE_ADMIN). */
    @GetMapping
    public List<TrialRequestResponse> listAll() {
        return trialRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(TrialRequestResponse::from)
                .toList();
    }

    @GetMapping("/me")
    public List<TrialRequestResponse> listMine(@AuthenticationPrincipal User user) {
        return trialRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(TrialRequestResponse::from)
                .toList();
    }
}
