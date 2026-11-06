package com.algoboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.algoboard.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailIgnoreCase(String email);

    User findByEmailVerificationToken(String emailVerificationToken);

    boolean existsByEmailIgnoreCase(String email);
}
