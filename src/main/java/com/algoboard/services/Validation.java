package com.algoboard.services;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class Validation {
    public Validation() {

    }

    public boolean isValidEmail(String email) {
        if (email == null || email.length() > 320) {
            return false;
        }
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }

    public boolean isValidPassword(String password) {
        // 8-72 characters with upper, lower, digit, and a non-alphanumeric character.
        // BCrypt only considers the first 72 bytes, so longer passwords are rejected.
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,72}$";
        return password != null
                && password.matches(passwordRegex)
                && password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    public boolean isValidPlatformUsername(String username) {
        if (username == null || username.isEmpty()) {
            return true;
        }
        return username.length() <= 64 && username.matches("^[A-Za-z0-9_.-]+$");
    }

    public boolean isValidName(String name) {
        // Name must be 2-50 characters and may contain letters, spaces, hyphens, and apostrophes
        String nameRegex = "^[a-zA-Z][a-zA-Z '\\-]{1,49}$";
        return name != null && name.matches(nameRegex);
    }

}
