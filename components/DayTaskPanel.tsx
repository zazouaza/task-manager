import React, { useMemo } from 'react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { X, Plus, CalendarDays, Coffee } from 'lucide-react';

interface DayTaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  tasks: Task[];
  onAddTask: (date: Date) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export const DayTaskPanel: React.FC<DayTaskPanelProps> = ({
  isOpen,
  onClose,
  date,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask
}) => {
  
  // Sort tasks: Not done first, then by priority
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      const pMap: Record<string, number> = { high: 3, medium: 2, low: 1, auto: 0 };
      return pMap[b.priority] - pMap[a.priority];
    });
  }, [tasks]);

  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-dark-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-dark-900/50">
          <div>
             <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-1">
                <CalendarDays className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
               {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
             </h2>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} scheduled
             </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 custom-scrollbar">
           {sortedTasks.length > 0 ? (
             sortedTasks.map(task => (
               <TaskCard 
                 key={task.id} 
                 task={task} 
                 onToggle={onToggleTask}
                 onEdit={onEditTask}
                 onDelete={onDeleteTask}
               />
             ))
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-dark-800/50 p-8">
                <div className="w-16 h-16 bg-white dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                   <Coffee className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No tasks yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-[200px]">
                  Enjoy your free day or schedule something to get ahead.
                </p>
                <button 
                  onClick={() => onAddTask(date)}
                  className="mt-6 text-primary-600 dark:text-primary-400 font-medium text-sm hover:underline"
                >
                  Create a task now
                </button>
             </div>
           )}
        </div>

        {/* Footer Action */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-10 safe-area-bottom">
           <button
             onClick={() => onAddTask(date)}
             className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
           >
             <Plus className="w-5 h-5" />
             Add Task to {date.toLocaleDateString('en-US', { weekday: 'short' })}
           </button>
        </div>

      </div>
    </div>
  );
};