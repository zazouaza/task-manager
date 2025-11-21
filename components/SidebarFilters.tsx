import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Priority, Status, TaskFilters, SortOption, GroupOption } from '../types';
import { Filter, Calendar, Tag, Layers, CheckCircle2, ArrowUpDown, Group } from 'lucide-react';

export const SidebarFilters: React.FC = () => {
  const { filters, setFilters, tasks } = useTasks();

  // Extract unique categories and tags from tasks
  const categories = Array.from(new Set(tasks.map(t => t.category))).filter((c): c is string => !!c);
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || []))).filter((t): t is string => !!t);

  const toggleFilter = <K extends keyof Pick<TaskFilters, 'status' | 'priority' | 'category' | 'tags'>>(
    type: K,
    value: TaskFilters[K][number]
  ) => {
    setFilters(prev => {
      const current = prev[type] as typeof value[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated } as TaskFilters;
    });
  };

  return (
    <div className="w-full lg:w-64 shrink-0 space-y-8 lg:pr-4">
      
      {/* Sorting & Grouping */}
      <div className="space-y-4">
         <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
               <ArrowUpDown className="w-3 h-3" /> Sort By
            </h3>
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({...prev, sortBy: e.target.value as SortOption}))}
              className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
               <option value="latest">Latest Created</option>
               <option value="oldest">Oldest Created</option>
               <option value="priority_desc">Priority (High → Low)</option>
               <option value="priority_asc">Priority (Low → High)</option>
               <option value="due_soon">Due Date (Soonest)</option>
               <option value="due_late">Due Date (Latest)</option>
               <option value="alphabetical">Alphabetical</option>
            </select>
         </div>
         
         <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
               <Group className="w-3 h-3" /> Group By
            </h3>
            <select 
              value={filters.groupBy}
              onChange={(e) => setFilters(prev => ({...prev, groupBy: e.target.value as GroupOption}))}
              className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
               <option value="none">No Grouping</option>
               <option value="status">Status</option>
               <option value="priority">Priority</option>
               <option value="category">Category</option>
               <option value="due_date">Due Date</option>
            </select>
         </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Date Filters */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
           <Calendar className="w-3 h-3" /> Timeframe
        </h3>
        <div className="space-y-1">
           {['all', 'today', 'week', 'overdue'].map((range) => (
             <button
               key={range}
               onClick={() => setFilters(prev => ({ ...prev, dateRange: range as any }))}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize
                 ${filters.dateRange === range 
                   ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800'}`}
             >
               {range}
             </button>
           ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
           <CheckCircle2 className="w-3 h-3" /> Status
        </h3>
        <div className="space-y-1">
          {(['todo', 'in-progress', 'done'] as Status[]).map(status => (
            <label key={status} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                 ${filters.status.includes(status) 
                   ? 'bg-primary-600 border-primary-600' 
                   : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-400'}`}>
                 {filters.status.includes(status) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <input 
                type="checkbox" 
                checked={filters.status.includes(status)}
                onChange={() => toggleFilter('status', status)}
                className="hidden"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{status.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
           <Filter className="w-3 h-3" /> Priority
        </h3>
        <div className="space-y-1">
          {(['high', 'medium', 'low'] as Priority[]).map(prio => (
            <label key={prio} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                 ${filters.priority.includes(prio) 
                   ? 'bg-primary-600 border-primary-600' 
                   : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-400'}`}>
                 {filters.priority.includes(prio) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <input 
                type="checkbox" 
                checked={filters.priority.includes(prio)}
                onChange={() => toggleFilter('priority', prio)}
                className="hidden"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{prio}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Layers className="w-3 h-3" /> Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleFilter('category', cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all
                  ${filters.category.includes(cat)
                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 dark:bg-dark-800 dark:text-slate-400 dark:border-slate-700 hover:border-slate-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Tag className="w-3 h-3" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleFilter('tags', tag)}
                className={`px-2 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1
                  ${filters.tags.includes(tag)
                    ? 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800'
                    : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-dark-800'}`}
              >
                # {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};