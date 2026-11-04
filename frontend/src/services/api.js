import axios from 'axios';

const baseUrl = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token to all requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        const isPublicAuthRequest = ['/auth/login', '/auth/signup'].some((path) =>
          (config.url || '').endsWith(path)
        );
        if (token && !isPublicAuthRequest) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for better error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response.data; // Return only the data portion
      },
      (error) => {
        // Handle different types of errors
        if (error.response) {
          // Clear stale credentials and return to login when the token is rejected
          if (error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            if (!['/login', '/signup'].includes(window.location.pathname)) {
              window.location.assign('/login');
            }
          }
          // Server responded with error status
          const message = error.response.data?.message || error.response.data || 'Request failed';
          throw new Error(message);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Network error - please check your connection');
        } else {
          // Something else happened
          throw new Error(error.message || 'Request failed');
        }
      }
    );
  }

  // Token management functions
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // HTTP method helpers - now much simpler with axios
  async get(endpoint) {
    return await this.axiosInstance.get(endpoint);
  }

  async post(endpoint, data, config) {
    return await this.axiosInstance.post(endpoint, data, config);
  }

  async put(endpoint, data) {
    return await this.axiosInstance.put(endpoint, data);
  }

  async delete(endpoint, data) {
    return await this.axiosInstance.delete(endpoint, { data });
  }
}

const apiService = new ApiService();
export default apiService;