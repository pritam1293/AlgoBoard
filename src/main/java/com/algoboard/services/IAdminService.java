package com.algoboard.services;

import com.algoboard.DTO.RequestDTO.AdminProfile;
import com.algoboard.entities.Admin;

public interface IAdminService {
    public AdminProfile registerAdmin(Admin admin);

    public AdminProfile authenticateAdmin(String username, String email, String password);
}
