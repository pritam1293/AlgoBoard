import apiService from "./api";

class ContestService {
    // Get all contests from all platforms
    async getAllContests() {
        try {
            const response = await apiService.get("/contest/list");
            return response;
        } catch (error) {
            console.error("Error fetching contests:", error);
            throw new Error(`Failed to fetch contests: ${error.message}`);
        }
    }
}

const contestService = new ContestService();
export default contestService;
