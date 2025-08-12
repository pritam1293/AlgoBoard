package com.algoboard.controller;

import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.services.IUserService;
import com.algoboard.services.CustomUserDetailsService;
import com.algoboard.jwt.JwtService;
import com.algoboard.DTO.RequestDTO.LoginDTO;
import com.algoboard.DTO.RequestDTO.User;
import com.algoboard.DTO.RequestDTO.AuthenticationResponse;
import com.algoboard.utils.ResponseUtil;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api")
public class UserController {

    private final IUserService userService;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public UserController(
            IUserService userService,
            JwtService jwtService,
            CustomUserDetailsService customUserDetailsService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @GetMapping("/home")
    public String home() {
        return "Welcome to AlgoBoard!";
    }

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            // Remove password from response for security
            registeredUser.setPassword(null);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Signup successful", registeredUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Signup failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            // Authenticate user
            User user = userService.authenticateUser(loginDTO.getUsername(), loginDTO.getPassword());

            // Load UserDetails for JWT generation
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getUsername());

            // Generate JWT token
            String jwtToken = jwtService.generateToken(userDetails);

            // Create authentication response
            AuthenticationResponse authResponse = new AuthenticationResponse(
                    jwtToken,
                    user,
                    jwtService.getExpirationTime() / 1000 // Convert to seconds
            );

            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Login successful", authResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Login failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PutMapping("/update/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUserDetails(username, user);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User updated successfully", updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Update failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/platforms/codeforces")
    public ResponseEntity<?> getCodeforcesProfile(@RequestParam String username) {
        try {
            Codeforces codeforcesProfile = userService.getCodeforcesProfile(username);
            if (codeforcesProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Codeforces profile retrieved successfully",
                        codeforcesProfile));
            } else {
                return ResponseEntity.status(404)
                        .body(ResponseUtil.createErrorResponse("Codeforces profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching Codeforces profile: " + e.getMessage()));
        }
    }

    @GetMapping("/platforms/atcoder")
    public ResponseEntity<?> getAtcoderProfile(@RequestParam String username) {
        try {
            Atcoder atcoderProfile = userService.getAtcoderProfile(username);
            if (atcoderProfile != null) {
                return ResponseEntity.ok(
                        ResponseUtil.createSuccessResponse("AtCoder profile retrieved successfully", atcoderProfile));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("AtCoder profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching AtCoder profile: " + e.getMessage()));
        }
    }
}
