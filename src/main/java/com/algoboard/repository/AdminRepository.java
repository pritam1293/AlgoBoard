package com.algoboard.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.algoboard.entities.Admin;

public interface AdminRepository extends MongoRepository<Admin, String> {
    Admin findByUsername(String username);

    Admin findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
