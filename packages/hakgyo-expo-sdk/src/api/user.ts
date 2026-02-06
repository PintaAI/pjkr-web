import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { User } from '../types/auth';
import { Kelas, TryoutResult } from '../types/models';

export const userApi = {
  getProfile: () => 
    apiClient.get<User>(API_ENDPOINTS.USER.PROFILE),

  updateProfile: (data: Partial<User>) => 
    apiClient.put<User>(API_ENDPOINTS.USER.PROFILE, data), // Assuming PUT on profile endpoint

  getClasses: (userId?: string) => {
      // If userId is provided, construct the path using the function from endpoints.
      // However, API_ENDPOINTS.USER.KELAS is a function.
      if (userId) {
          return apiClient.get<Kelas[]>(API_ENDPOINTS.USER.KELAS(userId));
      }
      // Fallback or specific endpoint for 'my classes' if exists, or throw
       throw new Error('UserId is required for getClasses');
  },

  getTryoutResults: (userId?: string) => {
       if (userId) {
          return apiClient.get<TryoutResult[]>(API_ENDPOINTS.USER.TRYOUT_RESULTS(userId));
       }
       throw new Error('UserId is required for getTryoutResults');
  },

  registerPushToken: (token: string) => 
    apiClient.post<void>(API_ENDPOINTS.PUSH.REGISTER, { token }),
};
