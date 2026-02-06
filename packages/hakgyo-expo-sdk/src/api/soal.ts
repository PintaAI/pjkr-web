import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse, PaginatedResponse, QueryParams } from '../types/api';
import { KoleksiSoal, PracticeResult, PracticeSession } from '../types/models';

export const soalApi = {
  getCollection: (id: number) => 
    apiClient.get<KoleksiSoal>(API_ENDPOINTS.SOAL.GET(id)), // Note: Endpoint might be different for collection vs soal list

  listCollections: (params?: QueryParams) => 
    apiClient.get<PaginatedResponse<KoleksiSoal>>(API_ENDPOINTS.SOAL.LIST, params),

  createCollection: (data: Partial<KoleksiSoal>) => 
    apiClient.post<KoleksiSoal>(API_ENDPOINTS.SOAL.CREATE, data),

  practice: (collectionId: number) => 
    apiClient.post<PracticeSession>(`${API_ENDPOINTS.SOAL.LIST}/${collectionId}/practice`), // Inferring practice endpoint

  submitPractice: (sessionId: string, answers: unknown[]) => 
    apiClient.post<PracticeResult>(`${API_ENDPOINTS.SOAL.LIST}/practice/${sessionId}/submit`, { answers }),
};
