package com.sparkenglishkids.backend.controller;

import com.sparkenglishkids.backend.dto.ContactMessageRequest;
import com.sparkenglishkids.backend.dto.ContactMessageResponse;
import com.sparkenglishkids.backend.model.ContactMessage;
import com.sparkenglishkids.backend.repository.ContactMessageRepository;
import com.sparkenglishkids.backend.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class ContactMessageController {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageController(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @PostMapping
    public ResponseEntity<ContactMessageResponse> submit(@Valid @RequestBody ContactMessageRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .message(request.getMessage())
                .user(CurrentUser.get().orElse(null))
                .build();
        contactMessageRepository.save(message);
        return ResponseEntity.status(HttpStatus.CREATED).body(ContactMessageResponse.from(message));
    }

    /** Admin-only: enforced by SecurityConfig (GET /api/messages requires ROLE_ADMIN). */
    @GetMapping
    public List<ContactMessageResponse> listAll() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ContactMessageResponse::from)
                .toList();
    }
}
