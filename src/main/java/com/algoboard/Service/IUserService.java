package com.algoboard.Service;

import com.algoboard.Entities.Codeforces;
import com.algoboard.Entities.User;
import com.algoboard.Entities.Atcoder;
import com.algoboard.Entities.Codechef;

public interface IUserService {
    public User registerUser(User user);

    public User authenticateUser(String username, String password);

    public User updateUser(String username, User user);

    public Codeforces getCodeforcesProfile(String username);

    public Atcoder getAtcoderProfile(String username);

    public Codechef getCodechefProfile(String username);
}
