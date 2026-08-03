package com.sparkenglishkids.backend.repository;

import com.sparkenglishkids.backend.model.TrialRequest;
import com.sparkenglishkids.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrialRequestRepository extends JpaRepository<TrialRequest, Long> {
    List<TrialRequest> findAllByOrderByCreatedAtDesc();
    List<TrialRequest> findByUserOrderByCreatedAtDesc(User user);
}
