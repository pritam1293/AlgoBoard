package com.algoboard.controller;

import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Leetcode;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.User;
import com.algoboard.services.IUserService;
import com.algoboard.services.EmailService;
import com.algoboard.services.CustomUserDetailsService;
import com.algoboard.jwt.JwtService;
import com.algoboard.DTO.RequestDTO.UserAuthenticationResponse;
import com.algoboard.utils.ResponseUtil;
import java.util.Map;
import com.algoboard.DTO.RequestDTO.UserProfile;
import org.springframework.dao.DuplicateKeyException;
import com.algoboard.DTO.ContestDTO;
import java.util.List;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    private final EmailService emailService;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public UserController(IUserService userService, EmailService emailService,
            JwtService jwtService, CustomUserDetailsService customUserDetailsService) {
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
            UserProfile newProfile = userService.registerUser(user);

            // Send welcome email asynchronously (don't block the response)
            try {
                emailService.sendWelcomeEmail(newProfile.getEmail(), newProfile.getFirstName());
            } catch (Exception emailException) {
                // Log email error but don't fail the signup process
                System.err.println("Failed to send welcome email: " + emailException.getMessage());
            }

            // Remove password from response for security
            return ResponseEntity
                    .ok(ResponseUtil.createSuccessResponse("Signup successful. Welcome email sent!", newProfile));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Signup failed: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Signup failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            // Authenticate user
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
            UserProfile profile = userService.authenticateUser(username, email, password);

            // Load UserDetails for JWT generation
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(profile.getUsername());

            // Generate JWT token
            String jwtToken = jwtService.generateToken(userDetails);

            // Create authentication response
            UserAuthenticationResponse authResponse = new UserAuthenticationResponse(
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
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/users/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam String username) {
        try {
            UserProfile profile = userService.getUserProfile(username);
            if (profile != null) {
                return ResponseEntity
                        .ok(ResponseUtil.createSuccessResponse("User profile retrieved successfully", profile));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("User profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/users/profile")
    public ResponseEntity<?> updateUser(@RequestBody UserProfile profile) {
        try {
            UserProfile updatedProfile = userService.updateUserDetails(profile);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User updated successfully", updatedProfile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Update failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{username}/friends")
    public ResponseEntity<?> updateFriends(@PathVariable String username, @RequestBody Map<String, String> payload) {
        try {
            boolean success = userService.updateFriendsList(payload, username);
            if (success) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Friends list updated successfully", null));
            } else {
                return ResponseEntity.status(400)
                        .body(ResponseUtil.createErrorResponse("Failed to update friends list"));
            }
        } catch(Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    } 

    @GetMapping("/users/{username}/friends/check/{friendUsername}")
    public ResponseEntity<?> checkFriendship(@PathVariable String username, @PathVariable String friendUsername) {
        try {
            boolean isFriend = userService.checkFriendship(username, friendUsername);
            Map<String, Boolean> response = new HashMap<>();
            response.put("isFriend", isFriend);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Friendship status retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
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
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Update failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("auth/request-reset") // forgot password - enter email
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        try {
            userService.generateAndSendOtp(email);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("OTP sent to your email", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil
                    .createErrorResponse("Invalid email or the email is not registered: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("auth/verify-otp") // forgot password - enter otp
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        try {
            boolean valid = userService.verifyOtp(email, otp);
            if (valid) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("OTP verified successfully.", null));
            }
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Invalid OTP or OTP expired"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Verification failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("auth/reset-password") // forgot password enter new password
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");
        try {
            boolean success = userService.resetPassword(email, newPassword);
            if (success) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Password reset successfully", null));
            } else {
                return ResponseEntity.status(400)
                        .body(ResponseUtil.createErrorResponse("Invalid reset token or token expired"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ResponseUtil.createErrorResponse("Reset failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/delete")
    public ResponseEntity<?> deleteUser(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        try {
            String response = userService.deleteUser(username, password);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse(response, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ResponseUtil.createErrorResponse("Delete failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("/add/cp/profiles")
    public ResponseEntity<?> addCPProfile(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String codeforcesId = payload.get("codeforcesId");
        String codechefId = payload.get("codechefId");
        String atcoderId = payload.get("atcoderId");
        String leetcodeId = payload.get("leetcodeId");
        try {
            boolean success = userService.addCPProfiles(username, codeforcesId, atcoderId, codechefId, leetcodeId);
            if (success) {
                if (codeforcesId != null)
                    return ResponseEntity
                            .ok(ResponseUtil.createSuccessResponse("Codeforces profile added successfully", null));
                if (atcoderId != null)
                    return ResponseEntity
                            .ok(ResponseUtil.createSuccessResponse("AtCoder profile added successfully", null));
                if (codechefId != null)
                    return ResponseEntity
                            .ok(ResponseUtil.createSuccessResponse("CodeChef profile added successfully", null));
                if (leetcodeId != null)
                    return ResponseEntity
                            .ok(ResponseUtil.createSuccessResponse("LeetCode profile added successfully", null));
                else {
                    return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Error in updating the profile", null));
                }
            } else {
                return ResponseEntity.status(400)
                        .body(ResponseUtil.createErrorResponse("Failed to add Codeforces profile"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/contest/list")
    public ResponseEntity<?> getContestList() {
        try {
            List<ContestDTO> contestList = userService.getContestList();
            return ResponseEntity
                    .ok(ResponseUtil.createSuccessResponse("Contest list retrieved successfully", contestList));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching contest list: " + e.getMessage()));
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

    @GetMapping("platforms/codechef")
    public ResponseEntity<?> getCodechefProfile(@RequestParam String username) {
        try {
            Codechef codechefProfile = userService.getCodechefProfile(username);
            if (codechefProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Codechef profile retrieved successfully",
                        codechefProfile));
            } else {
                return ResponseEntity.status(404)
                        .body(ResponseUtil.createErrorResponse("Codechef profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching Codechef profile: " + e.getMessage()));
        }
    }

    @GetMapping("platforms/leetcode")
    public ResponseEntity<?> getLeetcodeProfile(@RequestParam String username) {
        try {
            Leetcode leetcodeProfile = userService.getLeetcodeProfile(username);
            if (leetcodeProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("LeetCode profile retrieved successfully",
                        leetcodeProfile));
            } else {
                return ResponseEntity.status(404)
                        .body(ResponseUtil.createErrorResponse("LeetCode profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching LeetCode profile: " + e.getMessage()));
        }
    }

    @GetMapping("users/search")
    public ResponseEntity<?> searchUser(@RequestParam String username) {
        try {
            // Create async tasks for each profile fetch
            CompletableFuture<Codeforces> codeforcesTask = CompletableFuture
                    .supplyAsync(() -> userService.getCodeforcesProfile(username));

            CompletableFuture<Atcoder> atcoderTask = CompletableFuture
                    .supplyAsync(() -> userService.getAtcoderProfile(username));

            CompletableFuture<Codechef> codechefTask = CompletableFuture
                    .supplyAsync(() -> userService.getCodechefProfile(username));

            CompletableFuture<Leetcode> leetcodeTask = CompletableFuture
                    .supplyAsync(() -> userService.getLeetcodeProfile(username));

            // Wait for all tasks to complete
            CompletableFuture.allOf(codeforcesTask, atcoderTask, codechefTask, leetcodeTask).join();

            // Collect results
            Map<String, Object> profiles = new HashMap<>();
            profiles.put("codeforces", codeforcesTask.get());
            profiles.put("atcoder", atcoderTask.get());
            profiles.put("codechef", codechefTask.get());
            profiles.put("leetcode", leetcodeTask.get());

            return ResponseEntity
                    .ok(ResponseUtil.createSuccessResponse("User profiles retrieved successfully", profiles));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error searching user profiles: " + e.getMessage()));
        }
    }
    
    @GetMapping("users/codeforces/profile")
    public ResponseEntity<?> fetchCodeforcesProfile(@RequestParam String username) {
        try {
            Codeforces codeforcesProfile = userService.fetchCodeforcesProfile(username);
            if (codeforcesProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Codeforces profile fetched successfully",
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

    @GetMapping("users/atcoder/profile")
    public ResponseEntity<?> fetchAtcoderProfile(@RequestParam String username) {
        try {
            Atcoder atcoderProfile = userService.fetchAtcoderProfile(username);
            if (atcoderProfile != null) {
                return ResponseEntity.ok(
                        ResponseUtil.createSuccessResponse("AtCoder profile fetched successfully", atcoderProfile));
            } else {
                return ResponseEntity.status(404).body(ResponseUtil.createErrorResponse("AtCoder profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching AtCoder profile: " + e.getMessage()));
        }
    }

    @GetMapping("users/codechef/profile")
    public ResponseEntity<?> fetchCodechefProfile(@RequestParam String username) {
        try {
            Codechef codechefProfile = userService.fetchCodechefProfile(username);
            if (codechefProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Codechef profile fetched successfully",
                        codechefProfile));
            } else {
                return ResponseEntity.status(404)
                        .body(ResponseUtil.createErrorResponse("Codechef profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching Codechef profile: " + e.getMessage()));
        }
    }

    @GetMapping("users/leetcode/profile")
    public ResponseEntity<?> fetchLeetcodeProfile(@RequestParam String username) {
        try {
            Leetcode leetcodeProfile = userService.fetchLeetcodeProfile(username);
            if (leetcodeProfile != null) {
                return ResponseEntity.ok(ResponseUtil.createSuccessResponse("LeetCode profile fetched successfully",
                        leetcodeProfile));
            } else {
                return ResponseEntity.status(404)
                        .body(ResponseUtil.createErrorResponse("LeetCode profile not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseUtil.createErrorResponse("Error fetching LeetCode profile: " + e.getMessage()));
        }
    }
}
