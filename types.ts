
export type Priority = 'low' | 'medium' | 'high' | 'auto';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string | null; // Changed from dueDate to match DB
  category: string;
  created_at?: string; // Changed from createdAt
  ai_generated?: boolean; // Changed from aiGenerated
  tags?: string[];
  subtasks?: string[];
  reminder?: string | null;
  duration_minutes?: number | null; // Changed from durationMinutes
  user_id: string;
}

export interface AIParseResult {
  title: string;
  datetime: string | null;
  priority: Priority;
  category: string;
  description: string;
  subtasks: string[];
  tags: string[];
  reminder: string | null;
  duration_minutes: number | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  AI_CHAT = 'ai_chat',
  PROFILE = 'profile'
}
