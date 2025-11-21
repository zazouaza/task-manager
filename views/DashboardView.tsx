import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LayoutGrid, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const DashboardView: React.FC = () => {
  const { tasks } = useTasks();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const pending = total - done;
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const urgent = tasks.filter(t => {
        if(!t.due_date || t.status === 'done') return false;
        const due = new Date(t.due_date).getTime();
        const now = Date.now();
        return due - now < 86400000 && due > now; // Due within 24 hours
    }).length;
    
    return { total, done, pending, highPriority, urgent };
  }, [tasks]);

  const chartData = [
    { name: 'Done', value: stats.done, color: '#10b981' }, // Emerald 500
    { name: 'Pending', value: stats.pending, color: '#6366f1' }, // Indigo 500
  ];

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your daily overview</p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-sm font-medium">Total Tasks</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.done}</div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending}</div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">High Priority</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.highPriority}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Productivity Pulse</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
              <span className="text-sm text-slate-500">Completion Rate</span>
            </div>
          </div>
        </div>

        {/* Quick Summary / Motivation */}
        <div className="space-y-4">
           {stats.highPriority > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full shrink-0">
                 <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-red-700 dark:text-red-300">Attention Required</h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                  You have <span className="font-bold">{stats.highPriority} high priority tasks</span> waiting for you. Tackle the hardest one first!
                </p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <h4 className="font-bold text-lg mb-2">Focus Tip</h4>
            <p className="text-indigo-100 text-sm leading-relaxed">
              "The key is not to prioritize what's on your schedule, but to schedule your priorities." 
              <br/><br/>
              Start with your most important task today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
