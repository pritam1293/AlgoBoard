package com.algoboard.controller;

import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.User;
import com.algoboard.services.IUserService;
import com.algoboard.services.EmailService;
import com.algoboard.services.CustomUserDetailsService;
import com.algoboard.jwt.JwtService;
import com.algoboard.DTO.RequestDTO.AuthenticationResponse;
import com.algoboard.utils.ResponseUtil;
import java.util.Map;
import com.algoboard.DTO.RequestDTO.Profile;

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
            Profile newProfile = userService.registerUser(user);

            // Send welcome email asynchronously (don't block the response)
            try {
                emailService.sendWelcomeEmail(newProfile.getEmail(), newProfile.getFirstName());
            } catch (Exception emailException) {
                // Log email error but don't fail the signup process
                System.err.println("Failed to send welcome email: " + emailException.getMessage());
            }

            // Remove password from response for security
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Signup successful. Welcome email sent!", newProfile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Signup failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            // Authenticate user
            String username = payload.get("username");
            String email = payload.get("email");
            String password = payload.get("password");
            Profile profile = userService.authenticateUser(username, email, password);

            // Load UserDetails for JWT generation
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(profile.getUsername());

            // Generate JWT token
            String jwtToken = jwtService.generateToken(userDetails);

            // Create authentication response
            AuthenticationResponse authResponse = new AuthenticationResponse(
                    jwtToken,
                    profile,
                    jwtService.getExpirationTime() / 1000 // Convert to seconds
            );

            // Send login notification email asynchronously (don't block the response)
            try {
                emailService.sendLoginNotification(profile.getEmail(), profile.getFirstName());
            } catch (Exception emailException) {
                // Log email error but don't fail the login process
                System.err.println("Failed to send login notification: " + emailException.getMessage());
            }
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Login successful", authResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Login failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/users/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam String username) {
        try {
            Profile profile = userService.getUserProfile(username);
            if (profile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User profile retrieved successfully", profile));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("User profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Error fetching user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/users/profile")
    public ResponseEntity<?> updateUser(@RequestBody Profile profile) {
        try {
            Profile updatedProfile = userService.updateUserDetails(profile);
            //send an email notification
            try {
                emailService.sendProfileUpdateNotification(updatedProfile.getEmail(), updatedProfile.getFirstName(), "profile");
            } catch (Exception emailException) {
                // Log email error but don't fail the update process
                System.err.println("Failed to send profile update notification: " + emailException.getMessage());
            }
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User updated successfully", updatedProfile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Update failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PutMapping("auth/change-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        try {
            Map<String, String> user = userService.updatePassword(username, oldPassword, newPassword);
            emailService.sendProfileUpdateNotification(user.get("email"), user.get("firstName"), "password");
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Password updated successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Update failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("auth/request-reset")//forgot password - enter email
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        System.out.println("");
        System.out.println("password reset request with email: " + email);
        try {
            userService.generateAndSendOtp(email);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("OTP sent to your email", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Invalid email or the email is not registered: " + e.getMessage()));
        } catch(Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("auth/verify-otp")//forgot password - enter otp
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        System.out.println("");
        System.out.println("OTP verification request for email: " + email + " with OTP: " + otp);
        try {
            boolean valid = userService.verifyOtp(email, otp);
            if (valid) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("OTP verified successfully.", null));
            }
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Invalid OTP or OTP expired"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Verification failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("auth/reset-password")//forgot password enter new password
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");
        System.out.println("");
        System.out.println("new password request with email: " + email);
        try {
            boolean success = userService.resetPassword(email, newPassword);
            if (success) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Password reset successfully", null));
            } else {
                return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Invalid reset token or token expired"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Reset failed: " + e.getMessage()));
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

    @PostMapping("/add/cp/profiles")
    public ResponseEntity<?> addCodeforcesProfile(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String codeforcesId = payload.get("codeforcesId");
        String codechefId = payload.get("codechefId");
        String atcoderId = payload.get("atcoderId");
        String leetcodeId = payload.get("leetcodeId");
        try {
            boolean success = userService.addCPProfiles(username, codeforcesId, atcoderId, codechefId, leetcodeId);
            if (success) {
                if(codeforcesId != null) return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Codeforces profile added successfully", null));
                if(atcoderId != null) return ResponseEntity.ok(ResponseUtil.createSuccessResponse("AtCoder profile added successfully", null));
                if(codechefId != null) return ResponseEntity.ok(ResponseUtil.createSuccessResponse("CodeChef profile added successfully", null));
                if(leetcodeId != null) return ResponseEntity.ok(ResponseUtil.createSuccessResponse("LeetCode profile added successfully", null));
                else {
                    return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Error in updating the profile", null));
                }
            } else {
                return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Failed to add Codeforces profile"));
            }
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
