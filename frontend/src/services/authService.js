import apiService from "./api";

class AuthService {
  // Register new user
  async signup(userData) {
    try {
      const response = await apiService.post("/auth/signup", userData);
      return response;
    } catch (error) {
      throw new Error(error.message || "Signup failed");
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await apiService.post("/auth/login", credentials);

      if (response.status === "success" && response.data.token) {
        // Store token in localStorage
        apiService.setAuthToken(response.data.token);

        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify(response.data));

        return response.data;
      }

      throw new Error(response.message || "Login failed");
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  }

  // Logout user
  logout() {
    apiService.removeAuthToken();
    localStorage.removeItem("userData");
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = apiService.getAuthToken();
    if (!token) return false;

    // Check if token is expired (optional)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Get current user data
  getCurrentUser() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  // Get current token
  getToken() {
    return apiService.getAuthToken();
  }

  // Request password reset OTP
  async requestPasswordReset(email) {
    try {
      const response = await apiService.post("/auth/request-reset", { email });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to send OTP");
    }
  }

  // Verify OTP
  async verifyOtp(email, otp) {
    try {
      const response = await apiService.post("/auth/verify-otp", {
        email,
        otp,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to verify OTP");
    }
  }

  // Reset password
  async resetPassword(email, newPassword, otp) {
    try {
      const response = await apiService.post("/auth/reset-password", {
        email,
        newPassword,
        otp,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to reset password");
    }
  }
}

const authService = new AuthService();
export default authService;
