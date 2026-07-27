import axios from 'axios';

// Create a configured axios instance
export const apiClient = axios.create({
  // baseURL: 'YOUR_API_BASE_URL',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
