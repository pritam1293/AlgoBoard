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

  // TODO: Other platform methods will be added when needed
  // async getAtcoderProfile(username) { ... }
  // async getCodechefProfile(username) { ... }
  // async getLeetcodeProfile(username) { ... }
}

const platformService = new PlatformService();
export default platformService;
