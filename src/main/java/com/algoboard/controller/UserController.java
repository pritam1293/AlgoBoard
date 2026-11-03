package com.algoboard.controller;

import com.algoboard.DTO.ContestDTO;
import com.algoboard.DTO.RequestDTO.UserAuthenticationResponse;
import com.algoboard.DTO.RequestDTO.UserProfile;
import com.algoboard.entities.User;
import com.algoboard.jwt.JwtService;
import com.algoboard.services.CustomUserDetailsService;
import com.algoboard.services.IUserService;
import com.algoboard.services.LoginAttemptService;
import com.algoboard.utils.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private static final String LOGIN_SCOPE = "login";
    private static final String PASSWORD_SCOPE = "password";
    private static final String DELETE_SCOPE = "delete";

    private final IUserService userService;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final LoginAttemptService loginAttemptService;

    public UserController(IUserService userService,
            JwtService jwtService,
            CustomUserDetailsService customUserDetailsService,
            LoginAttemptService loginAttemptService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
        this.loginAttemptService = loginAttemptService;
    }

    // GET /api/home
    @GetMapping("/home")
    public String home() {
        return "Welcome to AlgoBoard!";
    }

    // POST /api/auth/signup
    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            UserProfile newProfile = userService.registerUser(user);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Signup successful.", newProfile));
        } catch (IllegalArgumentException e) {
            logger.warn("Signup rejected: {}", e.getMessage());
            throw new IllegalArgumentException("Signup failed. Please check your details.");
        }
    }

    // POST /api/auth/login
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String ip = clientIp(request);

        if (loginAttemptService.isBlocked(LOGIN_SCOPE, email, ip)) {
            return tooManyRequests(loginAttemptService.retryAfterSeconds(LOGIN_SCOPE, email, ip));
        }

        try {
            UserProfile profile = userService.authenticateUser(email, password);
            loginAttemptService.recordSuccess(LOGIN_SCOPE, email, ip);

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(profile.getEmail());
            String jwtToken = jwtService.generateToken(userDetails);
            UserAuthenticationResponse authResponse = new UserAuthenticationResponse(
                    jwtToken,
                    profile,
                    jwtService.getExpirationTime() / 1000);

            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Login successful", authResponse));
        } catch (IllegalArgumentException e) {
            loginAttemptService.recordFailure(LOGIN_SCOPE, email, ip);
            throw e;
        }
    }

    // POST /api/auth/logout
    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        userService.revokeUserTokens(currentEmail(authentication));
        return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Logout successful", null));
    }

    // GET /api/users/profile?email={email} (email optional; omit for own profile)
    @GetMapping("/users/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam(required = false) String email,
            Authentication authentication) {
        String authenticatedEmail = currentEmail(authentication);
        if (email == null || email.isBlank() || email.equalsIgnoreCase(authenticatedEmail)) {
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse(
                    "User profile retrieved successfully", userService.getUserProfile(authenticatedEmail)));
        }
        return ResponseEntity.ok(ResponseUtil.createSuccessResponse(
                "User profile retrieved successfully", userService.getPublicProfile(email)));
    }

    // PUT /api/users/profile
    @PutMapping("/users/profile")
    public ResponseEntity<?> updateUser(@RequestBody UserProfile profile, Authentication authentication) {
        profile.setEmail(currentEmail(authentication));
        UserProfile updatedProfile = userService.updateUserDetails(profile);
        return ResponseEntity.ok(ResponseUtil.createSuccessResponse("User updated successfully", updatedProfile));
    }

    // PUT /api/auth/change-password
    @PutMapping("/auth/change-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> payload,
            Authentication authentication, HttpServletRequest request) {
        String email = currentEmail(authentication);
        String ip = clientIp(request);
        if (loginAttemptService.isBlocked(PASSWORD_SCOPE, email, ip)) {
            return tooManyRequests(loginAttemptService.retryAfterSeconds(PASSWORD_SCOPE, email, ip));
        }

        try {
            userService.updatePassword(email, payload.get("oldPassword"), payload.get("newPassword"));
            loginAttemptService.recordSuccess(PASSWORD_SCOPE, email, ip);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Password updated successfully", null));
        } catch (IllegalArgumentException e) {
            loginAttemptService.recordFailure(PASSWORD_SCOPE, email, ip);
            throw e;
        }
    }

    // DELETE /api/users/delete
    @DeleteMapping("/users/delete")
    public ResponseEntity<?> deleteUser(@RequestBody Map<String, String> payload,
            Authentication authentication, HttpServletRequest request) {
        String email = currentEmail(authentication);
        String ip = clientIp(request);
        if (loginAttemptService.isBlocked(DELETE_SCOPE, email, ip)) {
            return tooManyRequests(loginAttemptService.retryAfterSeconds(DELETE_SCOPE, email, ip));
        }

        try {
            String response = userService.deleteUser(email, payload.get("password"));
            loginAttemptService.recordSuccess(DELETE_SCOPE, email, ip);
            return ResponseEntity.ok(ResponseUtil.createSuccessResponse(response, null));
        } catch (IllegalArgumentException e) {
            loginAttemptService.recordFailure(DELETE_SCOPE, email, ip);
            throw e;
        }
    }

    // POST /api/add/cp/profiles
    @PostMapping("/add/cp/profiles")
    public ResponseEntity<?> addCPProfile(@RequestBody Map<String, String> payload, Authentication authentication) {
        String email = currentEmail(authentication);
        boolean success = userService.addCPProfiles(
                email,
                payload.get("codeforcesId"),
                payload.get("atcoderId"),
                payload.get("codechefId"),
                payload.get("leetcodeId"));
        if (!success) {
            throw new IllegalArgumentException("Unable to update platform profiles.");
        }
        return ResponseEntity.ok(ResponseUtil.createSuccessResponse("Platform profiles updated successfully", null));
    }

    // GET /api/contest/list
    @GetMapping("/contest/list")
    public ResponseEntity<?> getContestList() {
        List<ContestDTO> contestList = userService.getContestList();
        return ResponseEntity.ok(ResponseUtil.createSuccessResponse(
                "Contest list retrieved successfully", contestList));
    }

    // GET /api/platforms/codeforces?email={email}
    @GetMapping("/platforms/codeforces")
    public ResponseEntity<?> getCodeforcesProfile(@RequestParam String email) {
        return profileResponse("Codeforces profile retrieved successfully",
                userService.getCodeforcesProfile(email));
    }

    // GET /api/platforms/atcoder?email={email}
    @GetMapping("/platforms/atcoder")
    public ResponseEntity<?> getAtcoderProfile(@RequestParam String email) {
        return profileResponse("AtCoder profile retrieved successfully",
                userService.getAtcoderProfile(email));
    }

    // GET /api/platforms/codechef?email={email}
    @GetMapping("/platforms/codechef")
    public ResponseEntity<?> getCodechefProfile(@RequestParam String email) {
        return profileResponse("CodeChef profile retrieved successfully",
                userService.getCodechefProfile(email));
    }

    // GET /api/platforms/leetcode?email={email}
    @GetMapping("/platforms/leetcode")
    public ResponseEntity<?> getLeetcodeProfile(@RequestParam String email) {
        return profileResponse("LeetCode profile retrieved successfully",
                userService.getLeetcodeProfile(email));
    }

    // GET /api/users/codeforces/profile?username={username}
    @GetMapping("/users/codeforces/profile")
    public ResponseEntity<?> fetchCodeforcesProfile(@RequestParam String username) {
        return profileResponse("Codeforces profile fetched successfully",
                userService.fetchCodeforcesProfile(username));
    }

    // GET /api/users/atcoder/profile?username={username}
    @GetMapping("/users/atcoder/profile")
    public ResponseEntity<?> fetchAtcoderProfile(@RequestParam String username) {
        return profileResponse("AtCoder profile fetched successfully",
                userService.fetchAtcoderProfile(username));
    }

    // GET /api/users/codechef/profile?username={username}
    @GetMapping("/users/codechef/profile")
    public ResponseEntity<?> fetchCodechefProfile(@RequestParam String username) {
        return profileResponse("CodeChef profile fetched successfully",
                userService.fetchCodechefProfile(username));
    }

    // GET /api/users/leetcode/profile?username={username}
    @GetMapping("/users/leetcode/profile")
    public ResponseEntity<?> fetchLeetcodeProfile(@RequestParam String username) {
        return profileResponse("LeetCode profile fetched successfully",
                userService.fetchLeetcodeProfile(username));
    }

    private ResponseEntity<?> profileResponse(String message, Object profile) {
        return ResponseEntity.ok(ResponseUtil.createSuccessResponse(message, profile));
    }

    private String currentEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Authentication required.");
        }
        String email = authentication.getName();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authentication required.");
        }
        return email;
    }

    private String clientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    private ResponseEntity<?> tooManyRequests(long retryAfterSeconds) {
        long retryAfter = Math.max(1L, retryAfterSeconds);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(retryAfter))
                .body(ResponseUtil.createErrorResponse("Too many failed attempts. Try again later."));
    }
}
