import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse, PaginatedResponse, QueryParams } from '../types/api';
import { Kelas, Materi } from '../types/models';

export const kelasApi = {
  list: (params?: QueryParams) => 
    apiClient.get<PaginatedResponse<Kelas>>(API_ENDPOINTS.KELAS.LIST, params),

  get: (id: number) => 
    apiClient.get<Kelas>(API_ENDPOINTS.KELAS.GET(id)),

  create: (data: Partial<Kelas>) => 
    apiClient.post<Kelas>(API_ENDPOINTS.KELAS.CREATE, data),

  update: (id: number, data: Partial<Kelas>) => 
    apiClient.put<Kelas>(API_ENDPOINTS.KELAS.UPDATE(id), data),

  delete: (id: number) => 
    apiClient.delete<void>(API_ENDPOINTS.KELAS.DELETE(id)),

  join: (id: number) => 
    apiClient.post<void>(API_ENDPOINTS.KELAS.JOIN(id)),

  leave: (id: number) => 
    apiClient.post<void>(API_ENDPOINTS.KELAS.LEAVE(id)),

  getMaterials: (id: number) => 
    apiClient.get<Materi[]>(API_ENDPOINTS.KELAS.MATERIALS(id)),
};
