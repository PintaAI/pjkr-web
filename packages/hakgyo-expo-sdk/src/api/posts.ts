import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { PaginatedResponse, QueryParams } from '../types/api';
import { Post, Comment } from '../types/models';

export const postsApi = {
  list: (params?: QueryParams) => 
    apiClient.get<PaginatedResponse<Post>>(API_ENDPOINTS.POSTS.LIST, params),

  get: (id: number) => 
    apiClient.get<Post>(API_ENDPOINTS.POSTS.GET(id)),

  create: (data: Partial<Post>) => 
    apiClient.post<Post>(API_ENDPOINTS.POSTS.CREATE, data),

  update: (id: number, data: Partial<Post>) => 
    apiClient.put<Post>(API_ENDPOINTS.POSTS.UPDATE(id), data),

  delete: (id: number) => 
    apiClient.delete<void>(API_ENDPOINTS.POSTS.DELETE(id)),

  like: (id: number) => 
    apiClient.post<void>(API_ENDPOINTS.POSTS.LIKE(id)),

  unlike: (id: number) => 
    apiClient.delete<void>(API_ENDPOINTS.POSTS.LIKE(id)), // Assuming unlike is DELETE on like endpoint or similar

  getComments: (id: number) => 
    apiClient.get<Comment[]>(API_ENDPOINTS.POSTS.COMMENTS(id)),

  addComment: (id: number, content: string) => 
    apiClient.post<Comment>(API_ENDPOINTS.POSTS.COMMENTS(id), { content }),
};
