export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  files?: FileRecord[];
}

export interface FileRecord {
  id: string;
  path: string;
  name: string;
  content?: string;
  size: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
}

export type ReviewSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ReviewTemplate =
  | 'security'
  | 'performance'
  | 'code_quality'
  | 'documentation'
  | 'architecture';

export interface ReviewIssue {
  title: string;
  description: string;
  severity: ReviewSeverity;
  file?: string;
  line?: number;
}

export interface Review {
  id: string;
  projectId: string;
  title: string;
  template: ReviewTemplate;
  targetFiles: string[];
  summary: string;
  issues: ReviewIssue[];
  recommendations: string[];
  createdAt: string;
}

export interface AiProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  modelName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}
