import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { SidebarFilters } from '../components/SidebarFilters';
import { Search, Plus, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Task } from '../types';

const TaskListView: React.FC = () => {
  const { getFilteredTasks, toggleTaskStatus, deleteTask, createTask, updateTask, setFilters, filters } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredTasks = getFilteredTasks();

  // --- Grouping Logic ---
  const groupedTasks = useMemo(() => {
    if (filters.groupBy === 'none') return null;

    const groups: Record<string, Task[]> = {};
    
    filteredTasks.forEach(task => {
      let key = 'Other';
      if (filters.groupBy === 'status') key = task.status;
      else if (filters.groupBy === 'priority') key = task.priority;
      else if (filters.groupBy === 'category') key = task.category;
      else if (filters.groupBy === 'due_date') {
        if (!task.due_date) key = 'No Date';
        else {
           const due = new Date(task.due_date);
           const today = new Date();
           today.setHours(0,0,0,0);
           const dueDay = new Date(due);
           dueDay.setHours(0,0,0,0);
           
           if (dueDay.getTime() < today.getTime()) key = 'Overdue';
           else if (dueDay.getTime() === today.getTime()) key = 'Today';
           else key = 'Later';
        }
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [filteredTasks, filters.groupBy]);

  const handleCreate = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = async (taskData: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
  };

  const handleDelete = async (id: string) => {
     await deleteTask(id);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between bg-white/50 dark:bg-dark-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
         <div className="flex-1 w-full">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                  className="w-full bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-slate-900 dark:text-white h-10 pl-12 pr-4"
                />
            </div>
         </div>
         <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden px-3 py-2.5 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300"
            >
                <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button 
                onClick={handleCreate}
                className="flex-1 md:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Add Task</span>
                <span className="md:hidden">Add</span>
            </button>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
         {/* Sidebar Filters (Desktop) */}
         <div className="hidden lg:block overflow-y-auto custom-scrollbar pb-20 pr-2">
            <SidebarFilters />
         </div>

         {/* Mobile Filters Drawer */}
         {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}>
                <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-dark-900 p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Filters</h2>
                    <SidebarFilters />
                </div>
            </div>
         )}

         {/* Task List */}
         <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                   {filters.search ? 'Search Results' : 'Tasks'}
                   <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {filteredTasks.length}
                   </span>
                </h2>
            </div>
            
            {filteredTasks.length > 0 ? (
               <>
                 {/* Grouped View */}
                 {groupedTasks ? (
                    <div className="space-y-6">
                      {Object.entries(groupedTasks).map(([groupName, tasks]: [string, Task[]]) => (
                        <div key={groupName} className="space-y-3">
                           <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                              <ChevronDown className="w-4 h-4" />
                              {groupName.replace('-', ' ')} 
                              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 rounded-full">{tasks.length}</span>
                           </h3>
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              {tasks.map(task => (
                                <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                              ))}
                           </div>
                        </div>
                      ))}
                    </div>
                 ) : (
                   /* Standard List View */
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {filteredTasks.map(task => (
                          <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                      ))}
                   </div>
                 )}
               </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center bg-slate-50 dark:bg-dark-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-white dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No tasks found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Try adjusting your filters or create a new task.
                </p>
              </div>
            )}
         </div>
      </div>

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingTask}
        title={editingTask ? 'Edit Task' : 'New Task'}
      />
    </div>
  );
};

export default TaskListView;