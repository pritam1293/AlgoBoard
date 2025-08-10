package com.algoboard.services;

import com.algoboard.DTO.RequestDTO.UserDTO;
import com.algoboard.entities.Atcoder;
import com.algoboard.entities.Codechef;
import com.algoboard.entities.Codeforces;

public interface IUserService {
    public UserDTO registerUser(UserDTO user);

    public UserDTO authenticateUser(String username, String password);

    public UserDTO updateUserDetails(String username, UserDTO user);

    public UserDTO getUserByUsername(String username);

    public Codeforces getCodeforcesProfile(String username);

    public Atcoder getAtcoderProfile(String username);

    public Codechef getCodechefProfile(String username);
}
