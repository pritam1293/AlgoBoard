package com.algoboard.DTO.RequestDTO;

public class UserAuthenticationResponse {
    private String token;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private boolean student;
    private String codeforcesUsername;
    private String atcoderUsername;
    private String codechefUsername;
    private String leetcodeUsername;
    private long expiresIn;

    // Constructor with User and token
    public UserAuthenticationResponse(String token, UserProfile profile, long expiresIn) {
        this.token = token;
        this.username = profile.getUsername();
        this.firstName = profile.getFirstName();
        this.lastName = profile.getLastName();
        this.email = profile.getEmail();
        this.student = profile.isStudent();
        this.codeforcesUsername = profile.getCodeforcesUsername();
        this.atcoderUsername = profile.getAtcoderUsername();
        this.codechefUsername = profile.getCodechefUsername();
        this.leetcodeUsername = profile.getLeetcodeUsername();
        this.expiresIn = expiresIn;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
