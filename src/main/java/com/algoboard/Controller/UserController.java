package com.algoboard.Controller;

import com.algoboard.Service.IUserService;
import com.algoboard.Service.UserService;
import com.algoboard.Entities.User;
import com.algoboard.Entities.Atcoder;
import com.algoboard.Entities.Codeforces;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
public class UserController {

    private final IUserService userService;

    public UserController() {
        this.userService = new UserService();
    }

    @GetMapping("/home")
    public String home() {
        return "Welcome to AlgoBoard!";
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        User registeredUser = userService.registerUser(user);
        if (registeredUser != null) {
            return ResponseEntity.ok("Signup successful for user: " + registeredUser.getUsername());
        } else {
            return ResponseEntity.status(400).body("Signup failed. User with the same username may already exist.");
        }

    }

    @PostMapping("/login/{username}/{password}")
    public ResponseEntity<?> login(@PathVariable String username, @PathVariable String password) {
        User user = userService.authenticateUser(username, password);
        if (user != null) {
            return ResponseEntity.ok("Login successful for user: " + user.getUsername());
        } else {
            return ResponseEntity.status(401).body("Login failed. Invalid username or password.");
        }
    }

    @PutMapping("/update/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User user) {
        User updatedUser = userService.updateUser(username, user);
        if (updatedUser != null) {
            return ResponseEntity.ok("User updated successfully: " + updatedUser.getUsername());
        } else {
            return ResponseEntity.status(400).body("Update failed. User not found or invalid data.");
        }
    }

    @GetMapping("/codeforces/{username}")
    public ResponseEntity<?> getCodeforcesProfile(@PathVariable String username) {
        try {
            Codeforces codeforcesProfile = userService.getCodeforcesProfile(username);
            if (codeforcesProfile != null) {
                return ResponseEntity.ok(codeforcesProfile);
            } else {
                return ResponseEntity.status(404).body("Codeforces profile not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching Codeforces profile: " + e.getMessage());
        }
    }

    @GetMapping("/atcoder/{username}")
    public ResponseEntity<?> getAtcoderProfile(@PathVariable String username) {
        try {
            Atcoder atcoderProfile = userService.getAtcoderProfile(username);
            if (atcoderProfile != null) {
                return ResponseEntity.ok(atcoderProfile);
            } else {
                return ResponseEntity.status(404).body("AtCoder profile not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching AtCoder profile: " + e.getMessage());
        }
    }
}
