import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

/**
 * Centralized Axios instance for API communication
 * Handles authentication, error handling, and default configuration
 */

// Create axios instance with base URL from environment variable
const apiClient: AxiosInstance = axios.create({
  baseURL:'http://localhost:8080/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Automatically attach Bearer token from localStorage
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle global errors (401, 500, etc.)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful responses
    return response;
  },
  (error: AxiosError) => {
    // Handle different error status codes
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Unauthorized (401): Authentication token may be expired or invalid');
          // Clear token and redirect to login if needed
          localStorage.removeItem('authToken');
          // You can emit an event or redirect to login page here
          break;
        
        case 403:
          console.error('Forbidden (403): User does not have permission to access this resource');
          break;
        
        case 404:
          console.error('Not Found (404): Resource not found');
          break;
        
        case 500:
          console.error('Server Error (500): Internal server error');
          break;
        
        case 502:
          console.error('Bad Gateway (502): Service temporarily unavailable');
          break;
        
        case 503:
          console.error('Service Unavailable (503): Server is under maintenance');
          break;
        
        default:
          console.error(`Error (${status}):`, data || error.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received from server:', error.request);
    } else {
      // Error during request setup
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
