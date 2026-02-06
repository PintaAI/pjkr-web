import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export const notificationsApi = {
  registerToken: (token: string, deviceId?: string) => 
    apiClient.post<void>(API_ENDPOINTS.PUSH.REGISTER, { token, deviceId }),

  unregisterToken: (tokenId: string) => 
    apiClient.delete<void>(API_ENDPOINTS.PUSH.TOKEN_GET(tokenId)), // Assuming DELETE on ID endpoint
};
