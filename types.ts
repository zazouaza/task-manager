

export type Priority = 'low' | 'medium' | 'high' | 'auto';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string | null;
  category: string;
  tags: string[];
  subtasks: string[];
  reminder?: string | null;
  duration_minutes?: number | null;
  created_at: string;
  ai_generated?: boolean;
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

export type SortOption = 'latest' | 'oldest' | 'priority_desc' | 'priority_asc' | 'due_soon' | 'due_late' | 'alphabetical';
export type GroupOption = 'none' | 'status' | 'priority' | 'category' | 'due_date';

export interface TaskFilters {
  status: Status[];
  priority: Priority[];
  category: string[];
  tags: string[];
  search: string;
  dateRange: 'all' | 'today' | 'week' | 'overdue';
  sortBy: SortOption;
  groupBy: GroupOption;
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  CALENDAR = 'calendar',
  AI_CHAT = 'ai_chat',
  PROFILE = 'profile'
}