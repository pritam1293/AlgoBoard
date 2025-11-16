package com.algoboard.services;
import org.springframework.stereotype.Service;

@Service
public class Validation {
    public Validation() {

    }

    public boolean isValidUsername(String username) {
        // Username must be 3-20 characters long and can contain letters, numbers, underscores, and dots
        String usernameRegex = "^[a-zA-Z0-9._]{3,20}$";
        return username != null && username.matches(usernameRegex);
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
        // Name must only contain letters and spaces, and be 1-50 characters long
        String nameRegex = "^[a-zA-Z ]{1,50}$";
        return name != null && name.matches(nameRegex);
    }

    public boolean isValidInstitutionName(String institutionName) {
        // Institution name must be 1-100 characters long and can contain letters, numbers, spaces, and common punctuation
        String institutionNameRegex = "^[a-zA-Z0-9 .,'-]{1,100}$";
        return institutionName != null && institutionName.matches(institutionNameRegex);
    }
}
