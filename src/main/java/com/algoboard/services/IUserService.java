package com.algoboard.services;

import com.algoboard.DTO.RequestDTO.User;
import com.algoboard.entities.Atcoder;
// import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;
import com.algoboard.DTO.RequestDTO.PasswordDTO;
import com.algoboard.DTO.RequestDTO.LoginDTO;


public interface IUserService {
    public User registerUser(User user);

    public User authenticateUser(LoginDTO loginDTO);

    public User getUserProfile(String username);

    public User updateUserDetails(User user);

    public User updatePassword(PasswordDTO password);

    public boolean generateAndSendOtp(String email);

    public String verifyOtpAndGenerateResetToken(String email, String otp);

    public boolean resetPassword(String email, String newPassword, String resetToken);

    public String deleteUser(String username);

    public Codeforces getCodeforcesProfile(String username);

    public Atcoder getAtcoderProfile(String username);

    // public Codechef getCodechefProfile(String username);
}
