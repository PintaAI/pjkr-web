import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { PaginatedResponse, QueryParams } from '../types/api';
import { VocabularyItem, VocabularySet } from '../types/models';

export const vocabularyApi = {
  getDaily: () =>
    apiClient.get<VocabularyItem>(API_ENDPOINTS.VOCABULARY.DAILY),

  getSet: (id: number) =>
    apiClient.get<VocabularySet>(API_ENDPOINTS.VOCABULARY.SET_GET(id)),

  listSets: (params?: QueryParams) =>
    apiClient.get<PaginatedResponse<VocabularySet>>(API_ENDPOINTS.VOCABULARY.SETS, params),

  createSet: (data: Partial<VocabularySet>) =>
    apiClient.post<VocabularySet>(API_ENDPOINTS.VOCABULARY.SETS, data),

  // Vocabulary Items endpoints
  listItems: (params?: QueryParams & { creatorId?: string; collectionId?: string; type?: string; pos?: string; isLearned?: boolean; search?: string }) =>
    apiClient.get<PaginatedResponse<VocabularyItem>>(API_ENDPOINTS.VOCABULARY.ITEMS, params),

  getItem: (id: number) =>
    apiClient.get<VocabularyItem>(API_ENDPOINTS.VOCABULARY.ITEM_GET(id)),

  addItem: (setId: number, data: Partial<VocabularyItem>) =>
    apiClient.post<VocabularyItem>(API_ENDPOINTS.VOCABULARY.ITEMS, { ...data, collectionId: setId }),

  updateItem: (id: number, data: Partial<VocabularyItem>) =>
    apiClient.put<VocabularyItem>(API_ENDPOINTS.VOCABULARY.ITEM_GET(id), data),

  deleteItem: (id: number) =>
    apiClient.delete<void>(API_ENDPOINTS.VOCABULARY.ITEM_GET(id)),

  markLearned: (itemId: number) =>
    apiClient.put<VocabularyItem>(API_ENDPOINTS.VOCABULARY.ITEM_GET(itemId), { isLearned: true }),
};
