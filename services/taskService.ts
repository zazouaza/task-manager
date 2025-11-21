import { supabase } from '../lib/supabase';
import { Task } from '../types';

export const taskService = {
  /**
   * Fetch all tasks for the current user
   */
  async fetchTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Task[];
  },

  /**
   * Create a new task
   */
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'user_id'>, userId: string) {
    // Ensure defaults for arrays
    const cleanTask = {
      ...task,
      user_id: userId,
      tags: task.tags || [],
      subtasks: task.subtasks || [],
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([cleanTask])
      .select()
      .single();
      
    if (error) throw error;
    return data as Task;
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};