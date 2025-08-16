import apiService from './api';

const userService = {
  // Get user profile
  async getUserProfile() {
    try {
      // Get current user from localStorage to get username
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const username = currentUser.username;
      
      if (!username) {
        throw new Error('Username not found in local storage');
      }
      
      const response = await apiService.get(`/users/profile?username=${username}`);
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userData) {
    try {
      const response = await apiService.put('/users/profile', userData);
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Delete user account
  async deleteUserAccount() {
    try {
      const response = await apiService.delete('/users/profile');
      return response;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  },

  // Add competitive programming platform
  async addCPPlatform(payload) {
    try {
      const response = await apiService.post('/add/cp/profiles', payload);
      return response;
    } catch (error) {
      console.error('Error adding competitive programming platform:', error);
      throw error;
    }
  }
};

export default userService;