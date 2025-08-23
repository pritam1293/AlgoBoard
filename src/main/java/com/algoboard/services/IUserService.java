package com.algoboard.services;

import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codeforces;
import com.algoboard.entities.User;
import com.algoboard.DTO.ContestDTO;

import java.util.Map;
import java.util.List;

import com.algoboard.DTO.RequestDTO.Profile;

public interface IUserService {
    public Profile registerUser(User user);

    public Profile authenticateUser(String username, String email, String password);

    public Profile getUserProfile(String username);

    public Profile updateUserDetails(Profile profile);

    public Map<String, String> updatePassword(String username, String oldPassword, String newPassword);

    public boolean generateAndSendOtp(String email);

    public boolean verifyOtp(String email, String otp);

    public boolean resetPassword(String email, String newPassword);

    public String deleteUser(String username);

    public boolean addCPProfiles(String username, String codeforcesId, String atcoderId, String codechefId,
            String leetcodeId);

    public List<ContestDTO> getContestList();

    public Codeforces getCodeforcesProfile(String username);

    public Atcoder getAtcoderProfile(String username);

    // public Codechef getCodechefProfile(String username);
}
