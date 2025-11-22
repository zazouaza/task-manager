import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Plus, Tag, Clock, CalendarDays, AlarmClock } from 'lucide-react';
import { parseTaskFromInput } from '../services/geminiService';
import { useTasks } from '../context/TaskContext';
import { AIParseResult } from '../types';

const AIChatView: React.FC = () => {
  // FIX: Use createTask instead of addTask
  const { createTask } = useTasks();
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

  const handleConfirm = async () => {
    if (result) {
      try {
        await createTask({
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
      } catch (e) {
        console.error("Failed to create task via AI", e);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 text-center space-y-6">
        
        {!result && !loading && (
          <div className="max-w-2xl w-full flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-8 transform hover:scale-105 transition-transform animate-blob">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              TaskFlow AI
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-10 leading-relaxed text-xl font-medium max-w-lg">
              Just describe your task naturally. I'll handle the <span className="text-primary-600 dark:text-primary-400 font-bold">dates, priorities, and tags</span> for you.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {[
                    "Call Mom tomorrow at 5pm",
                    "Urgent report due Friday",
                    "Grocery run on Saturday morning",
                    "Read 30 mins every night"
                ].map((example, i) => (
                    <button 
                        key={i}
                        onClick={() => setInput(example)}
                        className="glass-panel p-5 rounded-2xl text-left hover:scale-[1.02] transition-transform text-slate-700 dark:text-slate-300 font-medium border border-white/30 dark:border-white/10 shadow-sm"
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
                <div className="w-20 h-20 rounded-full border-4 border-primary-100 dark:border-primary-900/30 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-spin" />
                </div>
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-xl animate-pulse">Analyzing...</p>
          </div>
        )}

        {result && (
          <div className="w-full max-w-lg glass-panel rounded-[2rem] border border-white/40 dark:border-white/10 overflow-hidden shadow-2xl text-left transition-all">
             <div className="p-5 border-b border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-white/5 flex justify-between items-center backdrop-blur-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    AI Parsed Result
                </h3>
                <span className="text-[10px] bg-primary-100/80 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-bold backdrop-blur-sm">
                    High Confidence
                </span>
             </div>
             
             <div className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Task Title</label>
                  <div className="font-black text-2xl text-slate-900 dark:text-white leading-tight">{result.title}</div>
                  {result.description && (
                      <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">{result.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                      <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Priority</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold capitalize
                        ${result.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                          result.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {result.priority}
                      </span>
                   </div>
                   <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                      <label className="text-xs font-bold text-slate-400 block mb-1 uppercase">Category</label>
                      <span className="inline-flex items-center text-slate-700 dark:text-slate-300 text-sm font-bold">
                        {result.category}
                      </span>
                   </div>
                </div>

                <div className="space-y-4">
                    {result.datetime && (
                    <div className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300 p-3 rounded-2xl hover:bg-white/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 font-bold uppercase">Due Date</span>
                            <span className="font-semibold text-base">{new Date(result.datetime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                    </div>
                    )}

                    {result.reminder && (
                    <div className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300 p-3 rounded-2xl hover:bg-white/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                            <AlarmClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 font-bold uppercase">Reminder</span>
                            <span className="font-semibold text-base">{new Date(result.reminder).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                    </div>
                    )}
                </div>

                {result.tags && result.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-white/10">
                      {result.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold border border-white/40 dark:border-white/10">
                             <Tag className="w-3 h-3" />
                             {tag}
                          </span>
                      ))}
                   </div>
                )}
             </div>
             <div className="p-5 bg-white/30 dark:bg-black/30 flex gap-4 border-t border-slate-200/50 dark:border-white/10 backdrop-blur-md">
               <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10 transition-colors"
               >
                 Cancel
               </button>
               <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
               >
                 <Plus className="w-5 h-5" />
                 Create Task
               </button>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 glass-panel rounded-t-[2.5rem] border-b-0 border-x-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
        <div className="relative flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your task..."
            disabled={loading}
            className="w-full bg-white/50 dark:bg-black/40 text-slate-900 dark:text-white rounded-3xl px-6 py-5 pr-16 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[70px] max-h-40 disabled:opacity-50 shadow-inner text-lg font-medium backdrop-blur-sm placeholder:text-slate-400"
            rows={1}
          />
          <button 
            onClick={handleParse}
            disabled={!input.trim() || loading}
            className="absolute right-3 bottom-3 p-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl transition-all disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4 font-medium hidden md:block opacity-70">
            Press Enter to submit
        </p>
      </div>
    </div>
  );
};

export default AIChatView;