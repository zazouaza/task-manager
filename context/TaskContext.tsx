import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Status, TaskFilters, Priority } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { taskService } from '../services/taskService';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  filters: TaskFilters;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilters>>;
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  getFilteredTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    category: [],
    tags: [],
    search: '',
    dateRange: 'all',
    sortBy: 'latest',
    groupBy: 'none'
  });

  // 1. Fetch Initial Tasks
  const refreshTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await taskService.fetchTasks(user.id);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. Realtime Subscription
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    refreshTasks();

    const channel = supabase
      .channel('tasks_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            setTasks((prev) => {
              // Deduplication: Don't add if already exists (e.g. from optimistic update)
              if (prev.some(t => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshTasks]);

  // 3. CRUD Operations
  const createTask = async (newTaskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    
    try {
      // 1. Call Service
      const createdTask = await taskService.createTask(newTaskData, user.id);
      
      // 2. Update State Immediately (Optimistic/Confirmed)
      setTasks(prev => {
        if (prev.some(t => t.id === createdTask.id)) return prev;
        return [createdTask, ...prev];
      });

    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      await taskService.updateTask(id, updates);
    } catch (error) {
      console.error("Failed to update task:", error);
      refreshTasks(); // Revert on error
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Optimistic Update
      setTasks(prev => prev.filter(t => t.id !== id));
      await taskService.deleteTask(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      refreshTasks(); // Revert on error
      throw error;
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextStatus: Status = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
    await updateTask(id, { status: nextStatus });
  };

  // 4. Advanced Filtering & Sorting Logic
  const getFilteredTasks = useCallback(() => {
    let result = tasks.filter(task => {
      // Search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) || 
          (task.description && task.description.toLowerCase().includes(searchLower)) ||
          (task.tags && task.tags.some(t => t.toLowerCase().includes(searchLower)));
        if (!matchesSearch) return false;
      }

      // Status
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;

      // Priority
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;

      // Category
      if (filters.category.length > 0 && !filters.category.includes(task.category)) return false;

      // Tags
      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some(filterTag => task.tags?.includes(filterTag));
        if (!hasTag) return false;
      }

      // Date Range
      if (filters.dateRange !== 'all' && task.due_date) {
        const due = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filters.dateRange === 'overdue') {
           if (due < today && task.status !== 'done') return true;
           return false;
        }

        const isToday = due.toDateString() === today.toDateString();
        if (filters.dateRange === 'today' && !isToday) return false;

        if (filters.dateRange === 'week') {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          if (due < today || due > nextWeek) return false;
        }
      } else if (filters.dateRange !== 'all' && !task.due_date) {
        return false;
      }

      return true;
    });

    // Sorting Logic
    return result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'latest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority_desc': {
          const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1, auto: 0 };
          return priorityMap[b.priority] - priorityMap[a.priority];
        }
        case 'priority_asc': {
          const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1, auto: 0 };
          return priorityMap[a.priority] - priorityMap[b.priority];
        }
        case 'due_soon':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'due_late':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  }, [tasks, filters]);

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      loading, 
      filters, 
      setFilters, 
      createTask, 
      updateTask, 
      deleteTask, 
      toggleTaskStatus,
      getFilteredTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};