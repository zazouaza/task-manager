import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Status } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  getTasksByStatus: (status: Status) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else if (data) {
      setTasks(data as Task[]);
    }
    setLoading(false);
  }, [user]);

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user, fetchTasks]);

  const addTask = useCallback(async (newTask: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    const taskPayload = {
      ...newTask,
      user_id: user.id,
      // Ensure arrays are initialized
      tags: newTask.tags || [],
      subtasks: newTask.subtasks || []
    };

    // Optimistic UI update
    const tempId = crypto.randomUUID();
    const optimisticTask = { ...taskPayload, id: tempId, created_at: new Date().toISOString() } as Task;
    setTasks(prev => [optimisticTask, ...prev]);

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskPayload])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      // Rollback
      setTasks(prev => prev.filter(t => t.id !== tempId));
      alert('Failed to add task. Please try again.');
    } else if (data) {
      // Replace optimistic task with real one
      setTasks(prev => prev.map(t => t.id === tempId ? (data as Task) : t));
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
      fetchTasks(); // Revert on error
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      setTasks(previousTasks); // Revert
    }
  }, [tasks]);

  const toggleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextStatus: Status = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
    
    await updateTask(id, { status: nextStatus });
  }, [tasks, updateTask]);

  const getTasksByStatus = useCallback((status: Status) => {
    return tasks.filter(t => t.status === status);
  }, [tasks]);

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, getTasksByStatus }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
