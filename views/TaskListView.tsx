import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { Search, SlidersHorizontal, ListFilter } from 'lucide-react';
import { Status } from '../types';

const TaskListView: React.FC = () => {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => filter === 'all' ? true : t.status === filter)
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, filter, search]);

  const tabs: { id: Status | 'all', label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'done', label: 'Completed' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 sticky top-0 z-10 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your progress</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-dark-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {tabs.map(tab => (
                <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${filter === tab.id 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                {tab.label}
                </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks by name, category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-900 dark:text-white shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 pb-8">
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
             {filteredTasks.map(task => (
                <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={toggleTaskStatus} 
                onDelete={deleteTask} 
                />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-slate-50 dark:bg-dark-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-white dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No tasks found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Try adjusting your filters or create a new task using AI Assistant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListView;