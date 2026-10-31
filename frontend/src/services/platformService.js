import apiService from "./api";

class PlatformService {
  // Get Codeforces profile statistics
  async getCodeforcesProfile(email) {
    try {
      const response = await apiService.get(
        `/platforms/codeforces?email=${encodeURIComponent(email)}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching Codeforces profile:", error);
      throw new Error(`Failed to fetch Codeforces profile: ${error.message}`);
    }
  }

  // Get LeetCode profile statistics
  async getLeetcodeProfile(email) {
    try {
      const response = await apiService.get(
        `/platforms/leetcode?email=${encodeURIComponent(email)}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching LeetCode profile:", error);
      throw new Error(`Failed to fetch LeetCode profile: ${error.message}`);
    }
  }

  // Get AtCoder profile statistics
  async getAtcoderProfile(email) {
    try {
      const response = await apiService.get(
        `/platforms/atcoder?email=${encodeURIComponent(email)}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching AtCoder profile:", error);
      throw new Error(`Failed to fetch AtCoder profile: ${error.message}`);
    }
  }

  // Get CodeChef profile statistics
  async getCodechefProfile(email) {
    try {
      const response = await apiService.get(
        `/platforms/codechef?email=${encodeURIComponent(email)}`
      );

      return response;
    } catch (error) {
      console.error("Error fetching CodeChef profile:", error);
      throw new Error(`Failed to fetch CodeChef profile: ${error.message}`);
    }
  }

  // Get profile data for specific platform
  async getProfileByPlatform(platformId, email) {
    switch (platformId) {
      case 'codeforces':
        return await this.getCodeforcesProfile(email);
      case 'leetcode':
        return await this.getLeetcodeProfile(email);
      case 'atcoder':
        return await this.getAtcoderProfile(email);
      case 'codechef':
        return await this.getCodechefProfile(email);
      default:
        throw new Error(`Unsupported platform: ${platformId}`);
    }
  }

  // Get ALL platforms data in one optimized call (uses backend parallel processing)
  async getAllPlatformsData(email) {
    try {
      const response = await apiService.get(
        `/users/search?email=${encodeURIComponent(email)}`
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
