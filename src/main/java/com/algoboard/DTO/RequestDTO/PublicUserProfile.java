package com.algoboard.DTO.RequestDTO;

public class PublicUserProfile {
    private String firstName;
    private String lastName;
    private String codeforcesUsername;
    private String atcoderUsername;
    private String codechefUsername;
    private String leetcodeUsername;

    public PublicUserProfile() {
    }

    public PublicUserProfile(String firstName, String lastName, String codeforcesUsername,
            String atcoderUsername, String codechefUsername, String leetcodeUsername) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.codeforcesUsername = codeforcesUsername;
        this.atcoderUsername = atcoderUsername;
        this.codechefUsername = codechefUsername;
        this.leetcodeUsername = leetcodeUsername;
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
