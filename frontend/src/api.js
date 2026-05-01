import axios from "axios";

// Get API URL from environment or use fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('📡 API URL:', API_URL); // Debug log

const api = axios.create({
  baseURL: API_URL + "/api",
});

// ✅ Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Log all requests for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('❌ 404 Error - API endpoint not found');
      console.error('📍 Attempted URL:', error.config?.url);
      console.error('💡 Make sure REACT_APP_API_URL is set on Vercel');
    }
    return Promise.reject(error);
  }
);

export default api;