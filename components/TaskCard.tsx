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
    high: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    auto: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
  };

  return (
    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border backdrop-blur-sm ${colors[priority]}`}>
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
    <div className={`relative group glass-panel p-6 rounded-3xl transition-all hover:scale-[1.01] hover:shadow-xl animate-fade-in-up
      ${task.status === 'done' ? 'opacity-60 grayscale-[0.5]' : ''}
      ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
    `}>
      <div className="flex items-start gap-4">
        <button 
          onClick={() => onToggle(task.id)}
          className="mt-1 transition-all transform hover:scale-110 shrink-0"
        >
          {task.status === 'done' ? (
            <CheckCircle className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
          ) : task.status === 'in-progress' ? (
            <div className="w-7 h-7 rounded-full border-2 border-amber-500 flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-amber-500 rounded-full" />
            </div>
          ) : (
            <Circle className="w-7 h-7 text-slate-300 dark:text-slate-600 hover:text-primary-500 hover:stroke-[2.5]" />
          )}
        </button>
        
        <div className="flex-1 min-w-0 relative">
          <div className="flex justify-between items-start pr-8">
            <h3 className={`font-bold text-slate-900 dark:text-slate-100 truncate text-lg mb-1.5 ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
              {task.title}
            </h3>
            
            {/* 3-Dot Menu */}
            <div className="absolute right-[-10px] top-[-4px]" ref={menuRef}>
               <button 
                 onClick={() => setShowMenu(!showMenu)}
                 className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
               >
                 <MoreVertical className="w-5 h-5" />
               </button>
               
               {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 glass-panel bg-white/80 dark:bg-black/80 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200 backdrop-blur-xl">
                     <button 
                       onClick={() => { setShowMenu(false); onEdit(task); }}
                       className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2 font-bold transition-colors"
                     >
                        <Edit className="w-4 h-4" /> Edit
                     </button>
                     <button 
                       onClick={handleDeleteClick}
                       className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-bold transition-colors"
                     >
                        <Trash2 className="w-4 h-4" /> Delete
                     </button>
                  </div>
               )}
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium leading-relaxed opacity-90">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <PriorityBadge priority={task.priority} />
            
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/5 backdrop-blur-sm">
               {task.category}
            </div>

            {task.due_date && (
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border backdrop-blur-sm ${isOverdue ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100/50 dark:border-white/5">
                  {task.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5 px-2 py-1 rounded-md hover:bg-white/80 transition-colors">
                        <Tag className="w-3 h-3 opacity-50" />
                        {tag}
                      </span>
                  ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};