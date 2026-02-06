import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { Materi } from '../types/models';

export const materiApi = {
  get: (id: number) => 
    apiClient.get<Materi>(API_ENDPOINTS.MATERI.GET(id)),

  complete: (id: number) => 
    apiClient.post<void>(API_ENDPOINTS.MATERI.COMPLETE(id)),

  submitAssessment: (id: number, answers: unknown[]) => 
    apiClient.post<any>(API_ENDPOINTS.MATERI.ASSESSMENT(id), { answers }),
  
  getAssessmentConfig: (id: number) =>
    apiClient.get<any>(API_ENDPOINTS.MATERI.ASSESSMENT_CONFIG(id)),
};
