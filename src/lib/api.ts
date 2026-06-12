import axios from 'axios';

// Use a relative URL by default so it routes through Vite's local proxy (to avoid CORS)
// In production, VITE_API_URL can be set to the full URL (if frontend and backend are on same domain, it can also just be /api)
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookie-based sessions
});

// Optional: Add response interceptor for handling 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., trigger logout or redirect to login)
      // We will handle this in the auth store or query hooks usually
    }
    return Promise.reject(error);
  }
);
