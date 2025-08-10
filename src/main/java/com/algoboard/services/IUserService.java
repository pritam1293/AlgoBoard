package com.algoboard.services;

import com.algoboard.DTO.RequestDTO.User;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;

public interface IUserService {
    public User registerUser(User user);

    public User authenticateUser(String username, String password);

    public User updateUserDetails(String username, User user);

    public User getUserByUsername(String username);

    public Codeforces getCodeforcesProfile(String username);

    public Atcoder getAtcoderProfile(String username);

    public Codechef getCodechefProfile(String username);
}
