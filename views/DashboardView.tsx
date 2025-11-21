
import React, { useMemo, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, CheckCircle2, AlertCircle, Clock, Plus, CalendarDays, Loader2 } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { Task } from '../types';

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    </div>
  </div>
);

const DashboardView: React.FC = () => {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const { user } = useAuth();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

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
      if (window.confirm("Are you sure you want to delete this task?")) {
          await deleteTask(id);
      }
  };

  // Stats & Sections
  const { stats, sections } = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const pending = total - done;
    
    // Sections
    const todayTasks = tasks.filter(t => {
        if (t.status === 'done' || !t.due_date) return false;
        const due = new Date(t.due_date);
        return due <= todayEnd && due >= new Date(now.setHours(0,0,0,0));
    });

    const overdueTasks = tasks.filter(t => {
        if (t.status === 'done' || !t.due_date) return false;
        return new Date(t.due_date) < new Date();
    });

    const upcomingTasks = tasks.filter(t => {
        if (t.status === 'done' || !t.due_date) return false;
        return new Date(t.due_date) > todayEnd;
    }).slice(0, 5);

    return {
        stats: { total, done, pending, overdue: overdueTasks.length },
        sections: { todayTasks, overdueTasks, upcomingTasks }
    };
  }, [tasks]);

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (loading && tasks.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your daily overview</p>
        </div>
        <button 
            onClick={handleCreate}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center gap-2 transition-transform hover:scale-105 w-fit"
        >
            <Plus className="w-5 h-5" />
            New Task
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-sm font-medium">Total Tasks</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.done}</div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending}</div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Overdue</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.overdue}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Task Feed */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Overdue Section */}
            {sections.overdueTasks.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Overdue
                    </h3>
                    <div className="grid gap-3">
                        {sections.overdueTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </div>
                </div>
            )}

            {/* Today's Tasks */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary-500" /> Today's Tasks
                </h3>
                {sections.todayTasks.length > 0 ? (
                     <div className="grid gap-3">
                        {sections.todayTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">No specific tasks scheduled for today.</p>
                    </div>
                )}
            </div>

             {/* Upcoming */}
             <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming</h3>
                {sections.upcomingTasks.length > 0 ? (
                     <div className="grid gap-3">
                        {sections.upcomingTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">No upcoming tasks.</p>
                )}
            </div>
        </div>

        {/* Calendar / Widget Column */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { day: 'numeric' })}</h3>
                        <p className="text-indigo-200 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long' })}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
                        <span>Pending Today</span>
                        <span className="font-bold bg-white text-indigo-600 px-2 py-0.5 rounded-md">{sections.todayTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
                         <span>Completed</span>
                        <span className="font-bold bg-emerald-400/20 text-emerald-100 px-2 py-0.5 rounded-md">{stats.done}</span>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Modals */}
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

export default DashboardView;
