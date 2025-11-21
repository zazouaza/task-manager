import React, { useState, useRef, useEffect } from 'react';
import { Task, Priority, Status } from '../types';
import { CheckCircle, Circle, Clock, Tag, MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    auto: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  };

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${colors[priority]}`}>
      {priority}
    </span>
  );
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this task permanently?")) {
      onDelete(task.id);
    }
    setShowMenu(false);
  };

  return (
    <div className={`relative group bg-white dark:bg-dark-800 p-4 rounded-2xl border transition-all hover:shadow-md
      ${task.status === 'done' ? 'border-slate-100 dark:border-slate-800 opacity-75' : 'border-slate-200 dark:border-slate-700'}
      ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
    `}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task.id)}
          className="mt-1 text-slate-400 hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-400 transition-colors shrink-0"
        >
          {task.status === 'done' ? (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          ) : task.status === 'in-progress' ? (
            <div className="w-6 h-6 rounded-full border-2 border-amber-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
            </div>
          ) : (
            <Circle className="w-6 h-6 hover:stroke-2" />
          )}
        </button>
        
        <div className="flex-1 min-w-0 relative">
          <div className="flex justify-between items-start pr-6">
            <h3 className={`font-semibold text-slate-900 dark:text-slate-100 truncate text-base mb-0.5 ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
              {task.title}
            </h3>
            
            {/* 3-Dot Menu */}
            <div className="absolute right-[-10px] top-[-4px]" ref={menuRef}>
               <button 
                 onClick={() => setShowMenu(!showMenu)}
                 className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
               >
                 <MoreVertical className="w-5 h-5" />
               </button>
               
               {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-dark-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                     <button 
                       onClick={() => { setShowMenu(false); onEdit(task); }}
                       className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 flex items-center gap-2"
                     >
                        <Edit className="w-4 h-4" /> Edit
                     </button>
                     <button 
                       onClick={handleDeleteClick}
                       className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                     >
                        <Trash2 className="w-4 h-4" /> Delete
                     </button>
                  </div>
               )}
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 mb-2.5">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PriorityBadge priority={task.priority} />
            
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
               {task.category}
            </div>

            {task.due_date && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-slate-400 dark:text-slate-500">#{tag}</span>
                  ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};