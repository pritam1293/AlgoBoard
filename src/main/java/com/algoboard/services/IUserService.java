package com.algoboard.services;

import com.algoboard.entities.Atcoder;
// import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.User;

import java.util.Map;

import com.algoboard.DTO.RequestDTO.Profile;


public interface IUserService {
    public Profile registerUser(User user);

    public Profile authenticateUser(String username, String email, String password);

    public Profile getUserProfile(String username);

    public Profile updateUserDetails(Profile profile);

    public Map<String, String> updatePassword(String username, String oldPassword, String newPassword);

    public boolean generateAndSendOtp(String email);

    public String verifyOtpAndGenerateResetToken(String email, String otp);

    public boolean resetPassword(String email, String newPassword, String resetToken);

    public String deleteUser(String username);

    public Codeforces getCodeforcesProfile(String username);

    public Atcoder getAtcoderProfile(String username);

    // public Codechef getCodechefProfile(String username);
}
