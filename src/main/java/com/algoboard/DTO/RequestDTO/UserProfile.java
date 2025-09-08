package com.algoboard.DTO.RequestDTO;

import java.util.List;

public class UserProfile {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private boolean student;
    private String institutionName;
    private String codeforcesUsername;
    private String atcoderUsername;
    private String codechefUsername;
    private String leetcodeUsername;
    private List<String> friends;

    public UserProfile(String username, String firstName, String lastName, String email, boolean student,
                   String institutionName, String codeforcesUsername, String atcoderUsername,
                   String codechefUsername, String leetcodeUsername, List<String> friends) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.student = student;
        this.institutionName = institutionName;
        this.codeforcesUsername = codeforcesUsername;
        this.atcoderUsername = atcoderUsername;
        this.codechefUsername = codechefUsername;
        this.leetcodeUsername = leetcodeUsername;
        this.friends = friends;
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

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
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

    public List<String> getFriends() {
        return friends;
    }

    public void setFriends(List<String> friends) {
        this.friends = friends;
    }

    @Override
    public String toString() {
        return "UserProfile{" +
                "username='" + username + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", student=" + student +
                ", institutionName='" + institutionName + '\'' +
                ", codeforcesUsername='" + codeforcesUsername + '\'' +
                ", atcoderUsername='" + atcoderUsername + '\'' +
                ", codechefUsername='" + codechefUsername + '\'' +
                ", leetcodeUsername='" + leetcodeUsername + '\'' +
                ", friends=" + friends +
                '}';
    }
}
