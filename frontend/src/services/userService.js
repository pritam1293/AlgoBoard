import apiService from "./api";

const getCurrentUserEmail = () => {
  const currentUser = JSON.parse(localStorage.getItem("userData") || "{}");
  return currentUser.email;
};

const userService = {
  // Get the signed-in user's profile
  async getUserProfile() {
    try {
      const email = getCurrentUserEmail();

      if (!email) {
        throw new Error("Email not found in local storage");
      }

      const response = await apiService.get(
        `/users/profile?email=${encodeURIComponent(email)}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userData) {
    try {
      const response = await apiService.put("/users/profile", userData);
      return response;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Delete user account
  async deleteUserAccount(email, password) {
    try {
      const response = await apiService.delete("/users/delete", {
        email,
        password,
      });
      return response;
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  },

  // Add competitive programming platform
  async addCPPlatform(payload) {
    try {
      const response = await apiService.post("/add/cp/profiles", payload);
      return response;
    } catch (error) {
      console.error("Error adding competitive programming platform:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
  },

  // Get any user's profile by email
  async getUserProfileByEmail(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const response = await apiService.get(
        `/users/profile?email=${encodeURIComponent(email)}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user profile by email:", error);
      throw error;
    }
  },

  // Add friend
  async addFriend(currentEmail, friendEmail) {
    try {
      const response = await apiService.put(
        `/users/${encodeURIComponent(currentEmail)}/friends`,
        { add: friendEmail }
      );
      return response;
    } catch (error) {
      console.error("Error adding friend:", error);
      throw error;
    }
  },

  // Remove friend
  async removeFriend(currentEmail, friendEmail) {
    try {
      const response = await apiService.put(
        `/users/${encodeURIComponent(currentEmail)}/friends`,
        { remove: friendEmail }
      );
      return response;
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  },

  // Check friendship status
  async checkFriendshipStatus(currentEmail, friendEmail) {
    try {
      const response = await apiService.get(
        `/users/${encodeURIComponent(currentEmail)}/friends/check/${encodeURIComponent(friendEmail)}`
      );
      return response;
    } catch (error) {
      console.error("Error checking friendship status:", error);
      throw error;
    }
  },
};

export default userService;
