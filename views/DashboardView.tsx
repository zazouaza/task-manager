import React, { useMemo, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, CheckCircle2, AlertCircle, Clock, Plus, CalendarDays, Sparkles } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { Task } from '../types';

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
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
    <div className="space-y-10 animate-fade-in-up pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">{user?.name.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 text-xl font-medium tracking-tight">Ready to crush your goals today?</p>
        </div>
        <button 
            onClick={handleCreate}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl font-bold shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 hover:shadow-primary-500/20"
        >
            <Plus className="w-6 h-6" />
            New Task
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
           { label: 'Total Tasks', value: stats.total, icon: LayoutGrid, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10' },
           { label: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
           { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
           { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
           <div key={i} className="glass-panel p-6 rounded-[2rem] shadow-lg glass-card-hover">
             <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} backdrop-blur-sm`}>
                   <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</span>
             </div>
             <div className={`text-4xl font-black tracking-tight ${stat.color.replace('text-', 'text-slate-900 dark:text-white')}`}>{stat.value}</div>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Task Feed */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Overdue Section */}
            {sections.overdueTasks.length > 0 && (
                <div className="space-y-4 animate-fade-in-up">
                    <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 tracking-tight">
                        <AlertCircle className="w-6 h-6" /> Attention Needed
                    </h3>
                    <div className="grid gap-4">
                        {sections.overdueTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </div>
                </div>
            )}

            {/* Today's Tasks */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <CalendarDays className="w-6 h-6 text-primary-500" /> Today's Focus
                </h3>
                {sections.todayTasks.length > 0 ? (
                     <div className="grid gap-4">
                        {sections.todayTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center glass-panel rounded-[2rem] border-dashed border-2 border-slate-300/50 dark:border-slate-700/50">
                        <div className="w-16 h-16 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Sparkles className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg">All clear for today!</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Take a break or pick something from the backlog.</p>
                    </div>
                )}
            </div>

             {/* Upcoming */}
             <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Upcoming</h3>
                {sections.upcomingTasks.length > 0 ? (
                     <div className="grid gap-4">
                        {sections.upcomingTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 ml-1 font-medium">No upcoming tasks scheduled.</p>
                )}
            </div>
        </div>

        {/* Calendar / Widget Column */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden group transform transition-all hover:scale-[1.02]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors duration-700"></div>
                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                 
                 <div className="relative z-10 flex justify-between items-start mb-10">
                    <div>
                        <h3 className="text-5xl font-black tracking-tighter">{new Date().toLocaleDateString('en-US', { day: 'numeric' })}</h3>
                        <p className="text-indigo-200 font-bold text-lg uppercase tracking-widest mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long' })}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                        <CalendarDays className="w-8 h-8 text-white" />
                    </div>
                 </div>
                 
                 <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between text-sm bg-black/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-black/20 transition-colors">
                        <span className="font-bold opacity-80">Pending Today</span>
                        <span className="font-bold bg-white text-indigo-600 px-3 py-1 rounded-lg shadow-sm">{sections.todayTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-black/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-black/20 transition-colors">
                         <span className="font-bold opacity-80">Completed</span>
                        <span className="font-bold bg-emerald-500 text-white px-3 py-1 rounded-lg shadow-sm">{stats.done}</span>
                    </div>
                 </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem]">
               <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-primary-500" /> Productivity Tip
               </h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  "Break large tasks into smaller, actionable steps. Focus on one subtask at a time to maintain momentum."
               </p>
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