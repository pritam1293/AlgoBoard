package com.algoboard.controller;

import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.services.IUserService;
import com.algoboard.services.EmailService;
import com.algoboard.services.CustomUserDetailsService;
import com.algoboard.jwt.JwtService;
import com.algoboard.DTO.RequestDTO.LoginDTO;
import com.algoboard.DTO.RequestDTO.User;
import com.algoboard.DTO.RequestDTO.AuthenticationResponse;
import com.algoboard.utils.ResponseUtil;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api")
public class UserController {

    private final IUserService userService;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public UserController(
            IUserService userService,
            EmailService emailService,
            JwtService jwtService,
            CustomUserDetailsService customUserDetailsService) {
        this.userService = userService;
        this.emailService = emailService;
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

            // Send welcome email asynchronously (don't block the response)
            try {
                emailService.sendWelcomeEmail(registeredUser.getEmail(), registeredUser.getFirstName());
            } catch (Exception emailException) {
                // Log email error but don't fail the signup process
                System.err.println("Failed to send welcome email: " + emailException.getMessage());
            }

            // Remove password from response for security
            registeredUser.setPassword(null);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Signup successful. Welcome email sent!", registeredUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Signup failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
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

            // Send login notification email asynchronously (don't block the response)
            try {
                emailService.sendLoginNotification(user.getEmail(), user.getFirstName());
            } catch (Exception emailException) {
                // Log email error but don't fail the login process
                System.err.println("Failed to send login notification: " + emailException.getMessage());
            }

            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Login successful. Notification sent!", authResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Login failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/users/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam String username) {
        try {
            User user = userService.getUserProfile(username);
            if (user != null) {
                user.setPassword(null); // Remove password for security
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User profile retrieved successfully", user));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("User profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Error fetching user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/users/profile")
    public ResponseEntity<?> updateUser(@RequestBody User user) {
        try {
            User updatedUser = userService.updateUserDetails(user);
            //send an email notification
            try {
                // if(!user.getPassword().equals(updatedUser.getPassword())) {
                //     emailService.sendProfileUpdateNotification(updatedUser.getEmail(), updatedUser.getFirstName(), "password");
                // }
                if(!user.getEmail().equals(updatedUser.getEmail())) {
                    emailService.sendProfileUpdateNotification(updatedUser.getEmail(), updatedUser.getFirstName() , "email");
                }
                if(!user.getFirstName().equals(updatedUser.getFirstName()) || !user.getLastName().equals(updatedUser.getLastName())) {
                    emailService.sendProfileUpdateNotification(updatedUser.getEmail(), updatedUser.getFirstName() + " " + updatedUser.getLastName(), "name");
                }
                if(user.getAtcoderUsername() != null && !user.getAtcoderUsername().equals(updatedUser.getAtcoderUsername())
                    || user.getCodechefUsername() != null && !user.getCodechefUsername().equals(updatedUser.getCodechefUsername())
                    || user.getLeetcodeUsername() != null && !user.getLeetcodeUsername().equals(updatedUser.getLeetcodeUsername())
                    || user.getCodeforcesUsername() != null && !user.getCodeforcesUsername().equals(updatedUser.getCodeforcesUsername())) {
                    emailService.sendProfileUpdateNotification(updatedUser.getEmail(), updatedUser.getFirstName(), "competitive programming username");
                }
                else {
                    emailService.sendProfileUpdateNotification(updatedUser.getEmail(), updatedUser.getFirstName(), "profile");
                }
            } catch (Exception emailException) {
                // Log email error but don't fail the update process
                System.err.println("Failed to send profile update notification: " + emailException.getMessage());
            }
            updatedUser.setPassword(null); // Remove password for security
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User updated successfully", updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Update failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/delete")
    public ResponseEntity<?> deleteUser(@RequestParam String username) {
        try {
            String response = userService.deleteUser(username);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse(response, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Delete failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/platforms/codeforces")
    public ResponseEntity<?> getCodeforcesProfile(@RequestParam String username) {
        try {
            Codeforces codeforcesProfile = userService.getCodeforcesProfile(username);
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
    public ResponseEntity<?> getAtcoderProfile(@RequestParam String username) {
        try {
            Atcoder atcoderProfile = userService.getAtcoderProfile(username);
            if (atcoderProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("AtCoder profile retrieved successfully", atcoderProfile));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("AtCoder profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Error fetching AtCoder profile: " + e.getMessage()));
        }
    }

    // // Email Testing Endpoints - Remove in production
    // @PostMapping("/test/email/welcome")
    // public ResponseEntity<?> testWelcomeEmail(@RequestParam String email, @RequestParam String firstName) {
    //     try {
    //         emailService.sendWelcomeEmail(email, firstName);
    //         return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Welcome email sent to: " + email, null));
    //     } catch (Exception e) {
    //         return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Failed to send welcome email: " + e.getMessage()));
    //     }
    // }

    @PostMapping("/test/email/login")
    public ResponseEntity<?> testLoginEmail(@RequestParam String email, @RequestParam String firstName) {
        try {
            emailService.sendLoginNotification(email, firstName);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Login notification sent to: " + email, null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Failed to send login notification: " + e.getMessage()));
        }
    }
}
