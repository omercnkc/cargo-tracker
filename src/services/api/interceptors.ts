import { AxiosInstance } from 'axios';

export const setupInterceptors = (client: AxiosInstance) => {
  // Request Interceptor
  client.interceptors.request.use(
    (config) => {
      // e.g. inject auth token here
      // const token = await getAuthToken();
      // if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle global errors, token refresh, etc.
      return Promise.reject(error);
    }
  );
};
