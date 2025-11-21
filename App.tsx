
import React, { useState, useEffect } from 'react';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ViewState } from './types';
import { LayoutGrid, ListTodo, Sparkles, User, Sun, Moon, LogOut, Loader2, Command, Calendar } from 'lucide-react';
import DashboardView from './views/DashboardView';
import TaskListView from './views/TaskListView';
import AIChatView from './views/AIChatView';
import ProfileView from './views/ProfileView';
import CalendarView from './views/CalendarView';
import AuthView from './views/AuthView';

// Helper for theme
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// Main Layout Component (Protected)
const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: ViewState.TASKS, label: 'My Tasks', icon: <ListTodo className="w-5 h-5" /> },
    { id: ViewState.CALENDAR, label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: ViewState.AI_CHAT, label: 'AI Assistant', icon: <Sparkles className="w-5 h-5" />, special: true },
    { id: ViewState.PROFILE, label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <DashboardView />;
      case ViewState.TASKS: return <TaskListView />;
      case ViewState.CALENDAR: return <CalendarView />;
      case ViewState.AI_CHAT: return <AIChatView />;
      case ViewState.PROFILE: return <ProfileView />;
      default: return <DashboardView />;
    }
  };

  return (
    <TaskProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-dark-950 font-sans transition-colors duration-300 overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-slate-800">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
                <Command className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">TaskFlow</span>
            </div>
          </div>

          <div className="px-6 mb-6">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-100 dark:border-slate-700">
                <img src={user?.avatarUrl} alt="User" className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                   <p className="text-xs text-slate-500 truncate">Free Plan</p>
                </div>
             </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${currentView === item.id 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800'}`}
              >
                <div className={`${currentView === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between p-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Dark Mode</span>
                <ThemeToggle />
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden h-16 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-20">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  TF
               </div>
               <span className="font-bold text-slate-900 dark:text-white">TaskFlow</span>
            </div>
            <ThemeToggle />
          </header>

          <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 relative">
             <div className="max-w-5xl mx-auto w-full h-full pb-20 md:pb-0">
                {renderView()}
             </div>
          </div>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 w-full h-[80px] bg-white/90 dark:bg-dark-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 backdrop-blur-lg">
            {menuItems.map(item => (
               <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300
                  ${currentView === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`}
               >
                 {item.special ? (
                   <div className={`absolute -top-6 rounded-full p-3.5 shadow-lg transition-transform duration-300
                     ${currentView === item.id 
                       ? 'bg-gradient-to-br from-primary-500 to-indigo-600 scale-110 ring-4 ring-slate-50 dark:ring-dark-950' 
                       : 'bg-slate-800 dark:bg-slate-700 hover:scale-105 ring-4 ring-slate-50 dark:ring-dark-950'}`}>
                     <div className="text-white">
                       {item.icon}
                     </div>
                   </div>
                 ) : (
                   <div className={`mb-1 transition-transform ${currentView === item.id ? 'scale-110' : ''}`}>
                     {item.icon}
                   </div>
                 )}
                 <span className={`text-[10px] font-medium mt-1 ${item.special ? 'mt-6' : ''} ${currentView === item.id ? 'opacity-100' : 'opacity-0'}`}>
                   {item.label}
                 </span>
               </button>
            ))}
          </nav>
        </main>
      </div>
    </TaskProvider>
  );
};

// App Entry Point with Auth Check
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
             <Command className="w-6 h-6 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return <MainLayout />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
