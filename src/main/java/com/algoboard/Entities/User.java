package com.algoboard.entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    @Indexed(unique = true)
    private String username;
    private String firstName;
    private String lastName;
    private String password;
    @Indexed(unique = true)
    private String email;
    boolean student;
    private String codeforcesUsername;
    private String atcoderUsername;
    private String codechefUsername;
    private String leetcodeUsername;

    public User(String username, String firstName, String lastName, String password, String email, boolean student,
            String codeforcesUsername, String atcoderUsername, String codechefUsername, String leetcodeUsername) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.email = email;
        this.student = student;
        this.codeforcesUsername = codeforcesUsername;
        this.atcoderUsername = atcoderUsername;
        this.codechefUsername = codechefUsername;
        this.leetcodeUsername = leetcodeUsername;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isStudent() {
        return student;
    }

    public void setStudent(boolean student) {
        this.student = student;
    }

    public String getCodeforcesUsername() {
        return codeforcesUsername;
    }

    public void setCodeforcesUsername(String codeforcesUsername) {
        this.codeforcesUsername = codeforcesUsername;
    }

    public String getAtcoderUsername() {
        return atcoderUsername;
    }

    public void setAtcoderUsername(String atcoderUsername) {
        this.atcoderUsername = atcoderUsername;
    }

    public String getCodechefUsername() {
        return codechefUsername;
    }

    public void setCodechefUsername(String codechefUsername) {
        this.codechefUsername = codechefUsername;
    }

    public String getLeetcodeUsername() {
        return leetcodeUsername;
    }

    public void setLeetcodeUsername(String leetcodeUsername) {
        this.leetcodeUsername = leetcodeUsername;
    }
}
