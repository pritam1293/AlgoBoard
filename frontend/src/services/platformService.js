import apiService from "./api";

class PlatformService {
  // Get Codeforces profile statistics
  async getCodeforcesProfile(username) {
    try {
      console.log("🚀 API Call: GET /platforms/codeforces");
      console.log("📤 Request params: username =", username);
      console.log(
        "🔗 Full URL:",
        `${apiService.axiosInstance.defaults.baseURL}/platforms/codeforces?username=${username}`
      );

      const response = await apiService.get(
        `/platforms/codeforces?username=${username}`
      );

      console.log(
        "✅ Codeforces API Response:",
        JSON.stringify(response, null, 2)
      );
      return response;
    } catch (error) {
      console.error("❌ Error fetching Codeforces profile:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
