import { apiClient } from './client';
import { setupInterceptors } from './interceptors';

// Initialize the interceptors on the configured axios client
setupInterceptors(apiClient);

export { apiClient };
