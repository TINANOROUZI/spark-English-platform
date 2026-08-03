package com.sparkenglishkids.backend.security;

import com.sparkenglishkids.backend.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/** Reads the authenticated User (if any) from the current security context. */
public final class CurrentUser {

    private CurrentUser() {}

    public static Optional<User> get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }
}
