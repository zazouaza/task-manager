import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Plus, Tag, Clock, CalendarDays, AlarmClock } from 'lucide-react';
import { parseTaskFromInput } from '../services/geminiService';
import { useTasks } from '../context/TaskContext';
import { AIParseResult, Priority } from '../types';

const AIChatView: React.FC = () => {
  const { addTask } = useTasks();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIParseResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const parsed = await parseTaskFromInput(input);
      setResult(parsed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      addTask({
        title: result.title,
        description: result.description,
        priority: result.priority === 'auto' ? 'medium' : result.priority,
        status: 'todo',
        category: result.category === 'auto' ? 'General' : result.category,
        due_date: result.datetime,
        tags: result.tags,
        reminder: result.reminder,
        duration_minutes: result.duration_minutes,
        subtasks: result.subtasks,
        ai_generated: true
      });
      // Reset
      setResult(null);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 text-center space-y-6">
        
        {!result && !loading && (
          <div className="max-w-lg w-full flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6 transform hover:scale-105 transition-transform">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              TaskFlow AI
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-lg">
              Just type normally. I'll detect the <span className="text-slate-900 dark:text-slate-200 font-semibold">date, priority, tags, and reminders</span> automatically.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {[
                    "Call Mom tomorrow at 5pm",
                    "Urgent report due Friday",
                    "Grocery run on Saturday morning",
                    "Read 30 mins every night"
                ].map((example, i) => (
                    <button 
                        key={i}
                        onClick={() => setInput(example)}
                        className="text-sm px-4 py-3 bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-all text-left"
                    >
                        "{example}"
                    </button>
                ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900/30 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                </div>
            </div>
            <p className="text-slate-900 dark:text-white font-medium text-lg animate-pulse">Analyzing your request...</p>
          </div>
        )}

        {result && (
          <div className="w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl text-left transition-all">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-dark-900/50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary-500" />
                    AI Parsed Result
                </h3>
                <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
                    Confidence: High
                </span>
             </div>
             
             <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5 uppercase tracking-wide">Task Title</label>
                  <div className="font-semibold text-xl text-slate-900 dark:text-white leading-tight">{result.title}</div>
                  {result.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{result.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-50 dark:bg-dark-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <label className="text-xs font-medium text-slate-400 block mb-1">Priority</label>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize
                        ${result.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                          result.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {result.priority}
                      </span>
                   </div>
                   <div className="p-3 bg-slate-50 dark:bg-dark-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <label className="text-xs font-medium text-slate-400 block mb-1">Category</label>
                      <span className="inline-flex items-center text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {result.category}
                      </span>
                   </div>
                </div>

                <div className="space-y-3">
                    {result.datetime && (
                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400">Due Date</span>
                            {new Date(result.datetime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                    </div>
                    )}

                    {result.reminder && (
                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                            <AlarmClock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400">Reminder</span>
                            {new Date(result.reminder).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                    </div>
                    )}

                    {result.duration_minutes && (
                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400">Duration</span>
                            {result.duration_minutes} minutes
                        </div>
                    </div>
                    )}
                </div>

                {result.tags && result.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {result.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700">
                             <Tag className="w-3 h-3" />
                             {tag}
                          </span>
                      ))}
                   </div>
                )}

                {result.subtasks && result.subtasks.length > 0 && (
                   <div className="pt-2">
                      <label className="text-xs font-medium text-slate-400 block mb-2">Suggested Subtasks</label>
                      <ul className="space-y-2">
                        {result.subtasks.map((sub, idx) => (
                          <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-dark-900/30 p-2 rounded-lg">
                             <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary-400 rounded-full mt-2" />
                             {sub}
                          </li>
                        ))}
                      </ul>
                   </div>
                )}
             </div>
             <div className="p-4 bg-slate-50 dark:bg-dark-900/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
               <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
               >
                 Cancel
               </button>
               <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
               >
                 <Plus className="w-5 h-5" />
                 Create Task
               </button>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="relative flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your task (e.g., 'Schedule meeting with Bob on Friday at 2pm')"
            disabled={loading}
            className="w-full bg-slate-100 dark:bg-dark-800 text-slate-900 dark:text-white rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[60px] max-h-32 disabled:opacity-50 shadow-inner text-base"
            rows={1}
          />
          <button 
            onClick={handleParse}
            disabled={!input.trim() || loading}
            className="absolute right-3 bottom-3 p-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3 hidden md:block">
            Press Enter to submit, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIChatView;