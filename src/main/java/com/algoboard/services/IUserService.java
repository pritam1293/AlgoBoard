package com.algoboard.services;

import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Leetcode;
import com.algoboard.entities.User;
import com.algoboard.DTO.ContestDTO;

import java.util.Map;
import java.util.List;

import com.algoboard.DTO.RequestDTO.UserProfile;

public interface IUserService {
    public UserProfile registerUser(User user);

    public UserProfile authenticateUser(String username, String email, String password);

    public UserProfile getUserProfile(String username);

    public UserProfile updateUserDetails(UserProfile profile);

    public Map<String, String> updatePassword(String username, String oldPassword, String newPassword);

    public boolean generateAndSendOtp(String email);

    public boolean verifyOtp(String email, String otp);

    public boolean resetPassword(String email, String newPassword);

    public String deleteUser(String username, String password);

    public boolean addCPProfiles(String username, String codeforcesId, String atcoderId, String codechefId,
            String leetcodeId);

    public List<ContestDTO> getContestList();

    public Codeforces getCodeforcesProfile(String username);

    public Atcoder getAtcoderProfile(String username);

    public Codechef getCodechefProfile(String username);

    public Leetcode getLeetcodeProfile(String username);
}
