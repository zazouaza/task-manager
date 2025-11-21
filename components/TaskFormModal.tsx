import React, { useState, useEffect } from 'react';
import { Task, Priority, Status } from '../types';
import { X, Plus, Trash2, Calendar, Clock, Tag, AlertCircle, Loader2 } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => Promise<void>;
  initialData?: Task;
  title: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  // Reset or Populate on Open
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialData) {
        setTaskTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setPriority(initialData.priority || 'medium');
        setStatus(initialData.status || 'todo');
        setCategory(initialData.category || 'General');
        
        // Handle Date for input (requires YYYY-MM-DDTHH:mm format)
        if (initialData.due_date) {
            const d = new Date(initialData.due_date);
            // Adjust to local ISO string for input value
            const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            setDueDate(localIso);
        } else {
            setDueDate('');
        }

        setTags(initialData.tags ? initialData.tags.join(', ') : '');
        setSubtasks(initialData.subtasks || []);
      } else {
        // Reset defaults
        setTaskTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('todo');
        setCategory('General');
        setDueDate('');
        setTags('');
        setSubtasks([]);
      }
    }
  }, [isOpen, initialData]);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    try {
      await onSubmit({
        title: taskTitle,
        description,
        priority,
        status,
        category,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        tags: tagArray,
        subtasks
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <form id="taskForm" onSubmit={handleSubmit}>
            
            {error && (
               <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
               </div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all font-medium"
                  placeholder="What needs to be done?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none h-24 transition-all"
                  placeholder="Add details..."
                />
              </div>

              {/* Row 1: Priority, Status, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white appearance-none transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                   <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white appearance-none transition-all"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Due Date, Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="work, design, urgent"
                        className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                        />
                    </div>
                 </div>
              </div>

              {/* Subtasks */}
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subtasks</label>
                 <div className="space-y-2 mb-3">
                    {subtasks.map((sub, idx) => (
                       <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-dark-800 p-2 rounded-lg group">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full ml-2"></span>
                          <span className="flex-1 text-sm dark:text-slate-300">{sub}</span>
                          <button type="button" onClick={() => removeSubtask(idx)} className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all">
                             <X className="w-4 h-4" />
                          </button>
                       </div>
                    ))}
                 </div>
                 <div className="flex gap-2">
                    <input
                       type="text"
                       value={newSubtask}
                       onChange={(e) => setNewSubtask(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                       placeholder="Add a subtask..."
                       className="flex-1 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                    />
                    <button 
                       type="button" 
                       onClick={handleAddSubtask}
                       className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 rounded-xl transition-colors"
                    >
                       <Plus className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-dark-900/50 rounded-b-2xl">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             disabled={loading}
           >
             Cancel
           </button>
           <button 
             type="submit"
             form="taskForm"
             disabled={loading || !taskTitle}
             className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
           >
             {loading && <Loader2 className="w-4 h-4 animate-spin" />}
             {loading ? 'Saving...' : 'Save Task'}
           </button>
        </div>
      </div>
    </div>
  );
};