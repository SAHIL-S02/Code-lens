import axios from 'axios';
import type {
  AiProvider,
  ChatMessage,
  ChatSession,
  FileRecord,
  FileTreeNode,
  Project,
  Review,
  User,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      client.post<{ accessToken: string; user: User }>('/auth/register', data),
    login: (data: { email: string; password: string }) =>
      client.post<{ accessToken: string; user: User }>('/auth/login', data),
    me: () => client.get<User>('/auth/me'),
  },

  projects: {
    list: () => client.get<Project[]>('/projects'),
    get: (id: string) => client.get<Project>(`/projects/${id}`),
    create: (data: { name: string; description?: string }) =>
      client.post<Project>('/projects', data),
    delete: (id: string) => client.delete(`/projects/${id}`),
  },

  files: {
    getTree: (projectId: string) =>
      client.get<FileTreeNode[]>(`/projects/${projectId}/files/tree`),
    getContent: (projectId: string, path: string) =>
      client.get<FileRecord>(`/projects/${projectId}/files/content`, {
        params: { path },
      }),
    uploadZip: (projectId: string, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return client.post(`/projects/${projectId}/files/upload/zip`, form);
    },
    uploadFiles: (projectId: string, files: File[], paths: string[]) => {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      form.append('paths', JSON.stringify(paths));
      return client.post(`/projects/${projectId}/files/upload`, form);
    },
    importGithub: (projectId: string, repoUrl: string) =>
      client.post(`/projects/${projectId}/files/import/github`, { repoUrl }),
  },

  reviews: {
    list: (projectId: string, search?: string) =>
      client.get<Review[]>(`/projects/${projectId}/reviews`, {
        params: search ? { search } : {},
      }),
    get: (projectId: string, id: string) =>
      client.get<Review>(`/projects/${projectId}/reviews/${id}`),
    create: (
      projectId: string,
      data: {
        template: string;
        targetFiles?: string[];
        scope?: string;
      },
    ) => client.post<Review>(`/projects/${projectId}/reviews`, data),
  },

  chat: {
    send: (projectId: string, data: { message: string; sessionId?: string }) =>
      client.post<{ sessionId: string; messages: ChatMessage[] }>(
        `/projects/${projectId}/chat`,
        data,
      ),
    sessions: (projectId: string) =>
      client.get<ChatSession[]>(`/projects/${projectId}/chat/sessions`),
    getSession: (projectId: string, sessionId: string) =>
      client.get<{ id: string; messages: ChatMessage[] }>(
        `/projects/${projectId}/chat/sessions/${sessionId}`,
      ),
  },

  providers: {
    list: () => client.get<AiProvider[]>('/ai-providers'),
    create: (data: Partial<AiProvider>) =>
      client.post<AiProvider>('/ai-providers', data),
    update: (id: string, data: Partial<AiProvider>) =>
      client.patch<AiProvider>(`/ai-providers/${id}`, data),
    delete: (id: string) => client.delete(`/ai-providers/${id}`),
  },
};
