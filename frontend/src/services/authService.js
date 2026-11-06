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

  // Verify the email address using the token from the verification link
  async verifyEmail(token) {
    try {
      return await apiService.post("/auth/verify-email", { token });
    } catch (error) {
      throw new Error(error.message || "Email verification failed");
    }
  }

  // Request a new verification email for an unverified account
  async resendVerification(email) {
    try {
      return await apiService.post("/auth/resend-verification", { email });
    } catch (error) {
      throw new Error(error.message || "Could not resend the verification email");
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
    const token = apiService.getAuthToken();
    if (token) {
      apiService
        .post("/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(() => {});
    }
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
}

const authService = new AuthService();
export default authService;
