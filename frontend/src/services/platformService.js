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

  // TODO: Other platform methods will be added when needed
  // async getCodechefProfile(username) { ... }
}

const platformService = new PlatformService();
export default platformService;
