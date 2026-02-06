import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { Tryout, TryoutParticipant, TryoutResult } from '../types/models';

export const tryoutApi = {
  get: (id: number) => 
    apiClient.get<Tryout>(API_ENDPOINTS.TRYOUT.GET(id)),

  listActive: () => 
    apiClient.get<Tryout[]>(API_ENDPOINTS.TRYOUT.LIST, { active: true }),

  participate: (id: number) => 
    apiClient.post<TryoutParticipant>(API_ENDPOINTS.TRYOUT.PARTICIPATE(id)),

  submit: (tryoutId: number, answers: unknown[]) => 
    apiClient.post<TryoutResult>(API_ENDPOINTS.TRYOUT.SUBMIT(tryoutId), { answers }),

  getResults: (tryoutId: number) => 
    apiClient.get<TryoutResult>(API_ENDPOINTS.TRYOUT.RESULTS(tryoutId)),
};
