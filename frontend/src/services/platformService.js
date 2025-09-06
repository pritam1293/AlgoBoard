import apiService from "./api";

class PlatformService {
  // Get Codeforces profile statistics
  async getCodeforcesProfile(username) {
    try {
      const response = await apiService.get(
        `/platforms/codeforces?username=${username}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching Codeforces profile:", error);
      throw new Error(`Failed to fetch Codeforces profile: ${error.message}`);
    }
  }

  // Get LeetCode profile statistics
  async getLeetcodeProfile(username) {
    try {
      const response = await apiService.get(
        `/platforms/leetcode?username=${username}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching LeetCode profile:", error);
      throw new Error(`Failed to fetch LeetCode profile: ${error.message}`);
    }
  }

  // Get AtCoder profile statistics
  async getAtcoderProfile(username) {
    try {
      const response = await apiService.get(
        `/platforms/atcoder?username=${username}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching AtCoder profile:", error);
      throw new Error(`Failed to fetch AtCoder profile: ${error.message}`);
    }
  }

  // Get CodeChef profile statistics
  async getCodechefProfile(username) {
    try {
      const response = await apiService.get(
        `/platforms/codechef?username=${username}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching CodeChef profile:", error);
      throw new Error(`Failed to fetch CodeChef profile: ${error.message}`);
    }
  }

  // Get ALL platforms data in one optimized call (uses backend parallel processing)
  async getAllPlatformsData(username) {
    try {
      const response = await apiService.get(
        `/users/search?username=${username}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching all platforms data:", error);
      throw new Error(`Failed to fetch all platforms data: ${error.message}`);
    }
  }
}

const platformService = new PlatformService();
export default platformService;
