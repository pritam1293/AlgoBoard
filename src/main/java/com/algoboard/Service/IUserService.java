package com.algoboard.Service;

import com.algoboard.Entities.Codeforces;
import com.algoboard.Entities.User;

public interface IUserService {
    public User registerUser(User user);

    public User authenticateUser(String username, String password);

    public User updateUser(String username, User user);

    public Codeforces getCodeforcesProfile(String username);
}
