
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, Priority } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { TaskFormModal } from '../components/TaskFormModal';
import { DayTaskPanel } from '../components/DayTaskPanel';

type CalendarViewType = 'month' | 'week';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PriorityIndicator: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
    auto: 'bg-slate-400'
  };
  return <div className={`w-1.5 h-1.5 rounded-full ${colors[priority]} shrink-0`} />;
};

const CalendarView: React.FC = () => {
  const { tasks, updateTask, createTask, deleteTask, toggleTaskStatus } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  
  // Modal State (Edit/Create)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<Date | null>(null);

  // Panel State (Day View)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // --- Helpers ---
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  // Opens the actual Edit Modal (Directly from a task chip)
  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setEditingTask(task);
    setSelectedDateForNewTask(null);
    setIsModalOpen(true);
    // We can optionally close the panel if open, but usually keeping context is fine.
    // setIsPanelOpen(false); 
  };

  // Opens the Side Panel (from clicking a day cell)
  const handleCellClick = (date: Date) => {
    setSelectedDay(date);
    setIsPanelOpen(true);
  };

  // "Add Task" clicked inside the Day Panel
  const handleAddTaskFromPanel = (date: Date) => {
    setEditingTask(undefined);
    const d = new Date(date);
    d.setHours(9, 0, 0, 0); // Default to 9 AM
    setSelectedDateForNewTask(d);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (taskData: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
  };

  // --- Data Logic ---

  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    // Filter tasks that match the selected day (ignoring time)
    return tasks.filter(t => {
      if (!t.due_date) return false;
      // Compare Local Dates
      return new Date(t.due_date).toDateString() === selectedDay.toDateString();
    });
  }, [selectedDay, tasks]);

  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Tasks map for grid
    const tasksByDate: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!task.due_date) return;
      const dateStr = new Date(task.due_date).toDateString();
      if (!tasksByDate[dateStr]) tasksByDate[dateStr] = [];
      tasksByDate[dateStr].push(task);
    });

    if (viewType === 'month') {
      const days = [];
      // Previous month padding
      const prevMonthDays = getDaysInMonth(year, month - 1);
      for (let i = firstDay - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthDays - i);
        days.push({ date: d, isCurrentMonth: false, tasks: tasksByDate[d.toDateString()] || [] });
      }
      // Current month
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, isCurrentMonth: true, tasks: tasksByDate[d.toDateString()] || [] });
      }
      // Next month padding
      const remainingCells = 42 - days.length; // 6 rows * 7 cols
      for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: d, isCurrentMonth: false, tasks: tasksByDate[d.toDateString()] || [] });
      }
      return days;
    } else {
      // Week View
      const days = [];
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Go to Sunday
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({ date: d, isCurrentMonth: d.getMonth() === month, tasks: tasksByDate[d.toDateString()] || [] });
      }
      return days;
    }
  }, [currentDate, viewType, tasks]);

  const formatDateTitle = () => {
    if (viewType === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const start = calendarCells[0].date;
      const end = calendarCells[6].date;
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startStr} - ${endStr}, ${end.getFullYear()}`;
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white min-w-[200px]">
            {formatDateTitle()}
          </h2>
          <div className="flex items-center bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
            <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleToday} className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              Today
            </button>
            <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-dark-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setViewType('month')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewType === 'month' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setViewType('week')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${viewType === 'week' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-900/50">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className={`flex-1 grid grid-cols-7 overflow-y-auto custom-scrollbar ${viewType === 'month' ? 'grid-rows-6' : 'grid-rows-1'}`}>
          {calendarCells.map((cell, idx) => {
            const isToday = new Date().toDateString() === cell.date.toDateString();
            const sortedTasks = cell.tasks.sort((a, b) => {
                // Sort by status (done last), then priority
                if (a.status === 'done' && b.status !== 'done') return 1;
                if (a.status !== 'done' && b.status === 'done') return -1;
                
                const pMap: Record<string, number> = { high: 3, medium: 2, low: 1, auto: 0 };
                return pMap[b.priority] - pMap[a.priority];
            });

            // Show only first 3 tasks in month view to prevent overflow ugliness
            const visibleTasks = viewType === 'month' ? sortedTasks.slice(0, 3) : sortedTasks;
            const hiddenCount = sortedTasks.length - visibleTasks.length;

            return (
              <div 
                key={idx}
                onClick={() => handleCellClick(cell.date)}
                className={`
                  min-h-[100px] p-2 border-b border-r border-slate-100 dark:border-slate-700/50 relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700/30 transition-colors
                  ${!cell.isCurrentMonth && viewType === 'month' ? 'bg-slate-50/50 dark:bg-dark-900/30' : ''}
                  ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''} 
                `}
              >
                <div className="flex items-center justify-between mb-2">
                   <span className={`
                     text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                     ${isToday 
                       ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' 
                       : cell.isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}
                   `}>
                     {cell.date.getDate()}
                   </span>
                </div>

                <div className="space-y-1.5">
                  {visibleTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={(e) => handleTaskClick(e, task)}
                      title={task.title}
                      className={`
                        px-2 py-1.5 rounded-lg text-xs font-medium truncate cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center gap-1.5
                        ${task.status === 'done' 
                          ? 'bg-slate-100 text-slate-400 line-through dark:bg-dark-900 dark:text-slate-500' 
                          : 'bg-white dark:bg-dark-700 border border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary-300 dark:hover:border-primary-700'}
                      `}
                    >
                       <PriorityIndicator priority={task.priority} />
                       <span className="truncate flex-1">{task.title}</span>
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                     <div className="text-[10px] text-slate-400 font-medium pl-2">
                        + {hiddenCount} more
                     </div>
                  )}
                </div>
                
                {/* Hover Add hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                   <div className="bg-primary-600 text-white p-1.5 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200">
                      <Plus className="w-5 h-5" />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Task Panel */}
      <DayTaskPanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        date={selectedDay}
        tasks={tasksForSelectedDay}
        onAddTask={handleAddTaskFromPanel}
        onEditTask={(task) => {
            setEditingTask(task);
            setSelectedDateForNewTask(null);
            setIsModalOpen(true);
            // Keep panel open to see changes
        }}
        onDeleteTask={deleteTask}
        onToggleTask={toggleTaskStatus}
      />

      {/* Main Modal for Creating/Editing */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTask ? editingTask : { 
            title: '', 
            status: 'todo', 
            priority: 'medium', 
            category: 'General', 
            tags: [], 
            subtasks: [], 
            due_date: selectedDateForNewTask?.toISOString() 
        } as any}
        title={editingTask ? 'Edit Task' : 'New Task'}
      />
    </div>
  );
};

export default CalendarView;
