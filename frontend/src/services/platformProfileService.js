import apiService from './api';

class PlatformProfileService {
    // Fetch Codeforces profile
    async fetchCodeforcesProfile(username) {
        try {
            const url = `/users/codeforces/profile?username=${username}`;
            const response = await apiService.get(url);
            return response;
        } catch (error) {
            console.error('Platform Search - Error:', error);
            throw new Error(`Failed to fetch Codeforces profile: ${error.message}`);
        }
    }

    // Fetch AtCoder profile
    async fetchAtcoderProfile(username) {
        try {
            const url = `/users/atcoder/profile?username=${username}`;
            const response = await apiService.get(url);
            return response;
        } catch (error) {
            console.error('Platform Search - Error:', error);
            throw new Error(`Failed to fetch AtCoder profile: ${error.message}`);
        }
    }

    // Fetch CodeChef profile
    async fetchCodechefProfile(username) {
        try {
            const url = `/users/codechef/profile?username=${username}`;
            const response = await apiService.get(url);
            return response;
        } catch (error) {
            console.error('Platform Search - Error:', error);
            throw new Error(`Failed to fetch CodeChef profile: ${error.message}`);
        }
    }

    // Fetch LeetCode profile
    async fetchLeetcodeProfile(username) {
        try {
            const url = `/users/leetcode/profile?username=${username}`;
            const response = await apiService.get(url);
            return response;
        } catch (error) {
            console.error('Platform Search - Error:', error);
            throw new Error(`Failed to fetch LeetCode profile: ${error.message}`);
        }
    }

    // Generic method to fetch profile based on platform
    async fetchPlatformProfile(platform, username) {
        switch (platform.toLowerCase()) {
            case 'codeforces':
                return await this.fetchCodeforcesProfile(username);
            case 'atcoder':
                return await this.fetchAtcoderProfile(username);
            case 'codechef':
                return await this.fetchCodechefProfile(username);
            case 'leetcode':
                return await this.fetchLeetcodeProfile(username);
            default:
                console.error('Platform Search - Unsupported platform:', platform);
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}

const platformProfileService = new PlatformProfileService();
export default platformProfileService;
