import React, { useState, useEffect } from 'react';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ViewState } from './types';
import { LayoutGrid, ListTodo, Sparkles, User as UserIcon, Sun, Moon, LogOut, Loader2, Command, Calendar } from 'lucide-react';
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
      className="p-2 rounded-xl bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all backdrop-blur-md border border-white/20 shadow-sm"
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
    { id: ViewState.PROFILE, label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
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
      <div className="flex h-screen font-sans text-slate-900 dark:text-slate-50 overflow-hidden">
        
        {/* Desktop Sidebar - Glassmorphism */}
        <aside className="hidden md:flex w-72 flex-col glass-panel border-r-0 border-t-0 border-b-0 m-4 rounded-3xl z-20 relative overflow-hidden shadow-2xl">
          
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
              <Command className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              TaskFlow
            </span>
          </div>

          <div className="px-6 mb-6">
             <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-sm transition-all hover:bg-white/70 dark:hover:bg-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shrink-0 border-2 border-white/50 dark:border-white/10 shadow-sm">
                   <span className="text-lg font-bold text-primary-700 dark:text-white">
                      {user?.name.charAt(0).toUpperCase()}
                   </span>
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold truncate">{user?.name}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">Pro Workspace</p>
                </div>
             </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300
                  ${currentView === item.id 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 hover:scale-[1.02]'}`}
              >
                <div className={`${currentView === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/10 bg-white/10 dark:bg-black/10 backdrop-blur-md">
             <div className="flex items-center justify-between p-1">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Dark Mode</span>
                <ThemeToggle />
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden z-10">
          {/* Mobile Header */}
          <header className="md:hidden h-16 glass-panel flex items-center justify-between px-4 z-20 sticky top-0">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  TF
               </div>
               <span className="font-bold text-slate-900 dark:text-white">TaskFlow</span>
            </div>
            <ThemeToggle />
          </header>

          <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 relative no-scrollbar">
             <div className="max-w-7xl mx-auto w-full h-full pb-24 md:pb-0">
                {renderView()}
             </div>
          </div>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 h-[70px] glass-panel rounded-3xl flex items-center justify-around px-2 shadow-2xl z-40 border border-white/20 dark:border-white/10">
            {menuItems.map(item => (
               <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300
                  ${currentView === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`}
               >
                 {item.special ? (
                   <div className={`absolute -top-8 rounded-full p-4 shadow-xl transition-transform duration-300
                     ${currentView === item.id 
                       ? 'bg-gradient-to-br from-primary-500 to-indigo-600 scale-110 ring-4 ring-white dark:ring-black' 
                       : 'bg-slate-800 dark:bg-slate-700 hover:scale-105 ring-4 ring-white dark:ring-black'}`}>
                     <div className="text-white">
                       {item.icon}
                     </div>
                   </div>
                 ) : (
                   <div className={`mb-1 transition-transform ${currentView === item.id ? 'scale-110' : ''}`}>
                     {item.icon}
                   </div>
                 )}
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
      <div className="h-screen w-screen flex items-center justify-center glass-panel">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-2xl animate-blob">
             <Command className="w-8 h-8 text-white" />
          </div>
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