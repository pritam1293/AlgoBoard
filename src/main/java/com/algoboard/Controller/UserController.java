package com.algoboard.controller;

import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.services.IUserService;
import com.algoboard.services.UserService;
import com.algoboard.DTO.RequestDTO.LoginDTO;
import com.algoboard.DTO.RequestDTO.UserDTO;
import com.algoboard.utils.ResponseUtil;
import com.algoboard.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final IUserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    public UserController() {
        this.userService = new UserService();
    }

    @GetMapping("/home")
    public String home() {
        return "Welcome to AlgoBoard!";
    }

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody UserDTO user) {
        try {
            UserDTO registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Signup successful", registeredUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Signup failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            UserDTO user = userService.authenticateUser(loginDTO.getUsername(), loginDTO.getPassword());

            // Generate JWT token
            String jwtToken = jwtUtil.generateToken(user.getUsername());

            // Create response with token and user info
            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("token", jwtToken);
            loginResponse.put("user", user);

            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Login successful", loginResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Login failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    // Helper method to get current authenticated user
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PutMapping("/update/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody UserDTO user) {
        try {
            UserDTO updatedUser = userService.updateUserDetails(username, user);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User updated successfully", updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Update failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/platforms/codeforces")
    public ResponseEntity<?> getCodeforcesProfile() {
        try {
            // Get current user from JWT
            String currentUsername = getCurrentUsername();

            // Get user's stored codeforces username
            UserDTO user = userService.getUserByUsername(currentUsername);
            String codeforcesUsername = user.getCodeforcesUsername();

            if (codeforcesUsername == null || codeforcesUsername.isEmpty()) {
                return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("No Codeforces username configured. Please update your profile."));
            }

            Codeforces codeforcesProfile = userService.getCodeforcesProfile(codeforcesUsername);
            if (codeforcesProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Codeforces profile retrieved successfully", codeforcesProfile));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("Codeforces profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Error fetching Codeforces profile: " + e.getMessage()));
        }
    }

    @GetMapping("/platforms/atcoder")
    public ResponseEntity<?> getAtcoderProfile() {
        try {
            // Get current user from JWT
            String currentUsername = getCurrentUsername();

            // Get user's stored atcoder username
            UserDTO user = userService.getUserByUsername(currentUsername);
            String atcoderUsername = user.getAtcoderUsername();

            if (atcoderUsername == null || atcoderUsername.isEmpty()) {
                return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("No AtCoder username configured. Please update your profile."));
            }

            Atcoder atcoderProfile = userService.getAtcoderProfile(atcoderUsername);
            if (atcoderProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("AtCoder profile retrieved successfully", atcoderProfile));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("AtCoder profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Error fetching AtCoder profile: " + e.getMessage()));
        }
    }
}
