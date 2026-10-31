package com.algoboard.DTO.RequestDTO;

import java.util.Set;

public class UserProfile {
    private String firstName;
    private String lastName;
    private String email;
    private String codeforcesUsername;
    private String atcoderUsername;
    private String codechefUsername;
    private String leetcodeUsername;
    private Set<String> friends;

    public UserProfile(String firstName, String lastName, String email,
                   String codeforcesUsername, String atcoderUsername,
                   String codechefUsername, String leetcodeUsername, Set<String> friends) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.codeforcesUsername = codeforcesUsername;
        this.atcoderUsername = atcoderUsername;
        this.codechefUsername = codechefUsername;
        this.leetcodeUsername = leetcodeUsername;
        this.friends = friends;
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

    public Set<String> getFriends() {
        return friends;
    }

    public void setFriends(Set<String> friends) {
        this.friends = friends;
    }

    @Override
    public String toString() {
        return "UserProfile{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", codeforcesUsername='" + codeforcesUsername + '\'' +
                ", atcoderUsername='" + atcoderUsername + '\'' +
                ", codechefUsername='" + codechefUsername + '\'' +
                ", leetcodeUsername='" + leetcodeUsername + '\'' +
                ", friends=" + friends +
                '}';
    }
}
