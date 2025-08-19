import apiService from "./api";

const userService = {
  // Get user profile
  async getUserProfile() {
    try {
      // Get current user from localStorage to get username
      const currentUser = JSON.parse(localStorage.getItem("userData") || "{}");
      const username = currentUser.username;

      if (!username) {
        throw new Error("Username not found in local storage");
      }

      const response = await apiService.get(
        `/users/profile?username=${username}`
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
  async deleteUserAccount() {
    try {
      const response = await apiService.delete("/users/profile");
      return response;
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  },

  // Add competitive programming platform
  async addCPPlatform(payload) {
    try {
      console.log("🚀 API Call: POST /add/cp/profiles");
      console.log("📤 Request payload:", JSON.stringify(payload, null, 2));
      console.log(
        "🔗 Full URL:",
        `${apiService.axiosInstance.defaults.baseURL}/add/cp/profiles`
      );

      const response = await apiService.post("/add/cp/profiles", payload);

      console.log("✅ API Response:", JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error("❌ Error adding competitive programming platform:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
  },
};

export default userService;
