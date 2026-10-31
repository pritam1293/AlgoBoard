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

    public UserProfile authenticateUser(String email, String password);

    public UserProfile getUserProfile(String email);

    public UserProfile updateUserDetails(UserProfile profile);

    public boolean updateFriendsList(Map<String, String> payload, String email);

    public boolean checkFriendship(String email, String friendEmail);

    public Map<String, String> updatePassword(String email, String oldPassword, String newPassword);

    public String deleteUser(String email, String password);

    public boolean addCPProfiles(String email, String codeforcesId, String atcoderId, String codechefId,
            String leetcodeId);

    public List<ContestDTO> getContestList();

    public Codeforces getCodeforcesProfile(String email);

    public Atcoder getAtcoderProfile(String email);

    public Codechef getCodechefProfile(String email);

    public Leetcode getLeetcodeProfile(String email);

    public Codeforces fetchCodeforcesProfile(String cfusername);

    public Atcoder fetchAtcoderProfile(String atcusername);

    public Codechef fetchCodechefProfile(String ccusername);

    public Leetcode fetchLeetcodeProfile(String lcusername);
}
