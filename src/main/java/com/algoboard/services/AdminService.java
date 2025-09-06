package com.algoboard.services;

import org.springframework.stereotype.Service;

import com.algoboard.entities.Admin;
import com.algoboard.repository.AdminRepository;
import com.algoboard.DTO.RequestDTO.AdminProfile;

@Service
public class AdminService implements IAdminService {
    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public AdminProfile registerAdmin(Admin admin) {
        if(adminRepository.existsByUsername(admin.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if(adminRepository.existsByEmail(admin.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        adminRepository.save(admin);
        return ExtractProfile(admin);
    }

    @Override
    public AdminProfile authenticateAdmin(String username, String email, String password) {
        if(username != null && !username.isEmpty()) {
            Admin admin = adminRepository.findByUsername(username);
            if(admin != null && admin.getPassword().equals(password)) {
                return ExtractProfile(admin);
            }
        } else if(email != null && !email.isEmpty()) {
            Admin admin = adminRepository.findByEmail(email);
            if(admin != null && admin.getPassword().equals(password)) {
                return ExtractProfile(admin);
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    private AdminProfile ExtractProfile(Admin admin) {
        return new AdminProfile(
                admin.getUsername(),
                admin.getFirstName(),
                admin.getLastName(),
                admin.getEmail()
        );
    }
}