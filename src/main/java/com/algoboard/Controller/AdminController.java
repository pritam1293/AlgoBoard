package com.algoboard.controller;

import com.algoboard.DTO.RequestDTO.AdminProfile;
import com.algoboard.entities.Admin;
import com.algoboard.services.IAdminService;
import com.algoboard.utils.ResponseUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
// Removed class-level protection - will add method-level protection later
public class AdminController {

    private final IAdminService adminService;

    public AdminController(IAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/home")
    public String adminHome() {
        return "Welcome to the Admin Home Page!";
    }

    @PostMapping("auth/signup")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin admin) {
        try {
            AdminProfile profile = adminService.registerAdmin(admin);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Signup successful", profile));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseUtil.createErrorResponse("Error registering admin"));
        }
    }

    @PostMapping("auth/signin")
    public ResponseEntity<?> authenticateAdmin(@RequestBody Map<String, String> credentials) {
        try {
            String username = "";
            String email = "";
            String password = "";
            if(credentials.containsKey("username")) {
                username = credentials.get("username");
            } else if(credentials.containsKey("email")) {
                email = credentials.get("email");
            }
            if(credentials.containsKey("password")) {
                password = credentials.get("password");
            }
            AdminProfile profile = adminService.authenticateAdmin(username, email, password);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Login successful", profile));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseUtil.createErrorResponse("Invalid credentials"));
        }
    }
}
