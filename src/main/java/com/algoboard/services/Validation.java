package com.algoboard.services;
import org.springframework.stereotype.Service;

@Service
public class Validation {
    public Validation() {

    }

    public boolean isValidEmail(String email) {
        // Simple email validation regex
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }

    public boolean isValidPassword(String password) {
        // Password must be at least 8 characters long and contain at least one uppercase letter,
        // one lowercase letter, one digit, and one special character
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordRegex);
    }

    public boolean isValidName(String name) {
        // Name must be 2-50 characters and may contain letters, spaces, hyphens, and apostrophes
        String nameRegex = "^[a-zA-Z][a-zA-Z '\\-]{1,49}$";
        return name != null && name.matches(nameRegex);
    }

}
