package com.algoboard.Entities;

public class User {
    private String username;
    private String password;
    private String email;
    boolean student;

    public User(String username, String password, String email, boolean student) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.student = student;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    @Override
    public String toString() {
        return "User{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", student=" + student +
                '}';
    }
}
