import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle, Command, Wand2 } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'magic-link';

const AuthView: React.FC = () => {
  const { login, register, loginWithMagicLink } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        const { session } = await register(email, password, name);
        if (!session) {
          setSuccess('Registration successful! Please check your email to verify your account before logging in.');
          setMode('login');
        }
      } else if (mode === 'magic-link') {
        await loginWithMagicLink(email);
        setSuccess('Check your email! We sent you a magic link to sign in.');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 animate-fade-in-up relative overflow-hidden">
       
      <div className="w-full max-w-5xl glass-panel rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] relative z-10 border border-white/40 dark:border-white/10">
        
        {/* Left Side - Branding / Info */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-indigo-800 p-14 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 0 L100 0 L100 100 Z" fill="white" />
             </svg>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30 shadow-lg">
              <Command className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">Organize your work with AI power.</h1>
            <p className="text-indigo-100 text-lg font-medium max-w-sm leading-relaxed">Turn chaos into clarity. TaskFlow uses advanced Gemini models to parse your natural thoughts into actionable plans.</p>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-4 text-indigo-50 font-bold">
              <div className="p-1 bg-white/20 rounded-full"><CheckCircle className="w-5 h-5" /></div>
              <span>Natural Language Processing</span>
            </div>
            <div className="flex items-center gap-4 text-indigo-50 font-bold">
              <div className="p-1 bg-white/20 rounded-full"><CheckCircle className="w-5 h-5" /></div>
              <span>Smart Categorization</span>
            </div>
            <div className="flex items-center gap-4 text-indigo-50 font-bold">
              <div className="p-1 bg-white/20 rounded-full"><CheckCircle className="w-5 h-5" /></div>
              <span>Secure Cloud Sync</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white/40 dark:bg-black/40 backdrop-blur-md">
          
          <div className="md:hidden flex items-center gap-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg">
               <Command className="w-5 h-5" />
             </div>
             <span className="text-2xl font-black text-slate-900 dark:text-white">TaskFlow</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an account' : 'Magic Link Login'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              {mode === 'login' ? 'Please enter your details.' : mode === 'register' ? 'Get started with your free account.' : 'We will email you a link to sign in instantly.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/60 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-medium backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/60 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-medium backdrop-blur-sm"
                />
              </div>
            </div>

            {mode !== 'magic-link' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-white/60 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-medium backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-sm font-bold">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-sm font-bold">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Magic Link'}
                  {mode !== 'magic-link' && <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-5">
            {mode === 'login' && (
              <button 
                type="button"
                onClick={() => toggleMode('magic-link')}
                className="w-full bg-white/50 dark:bg-white/5 text-indigo-600 dark:text-indigo-300 font-bold py-3.5 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-dashed border-indigo-300 dark:border-indigo-800"
              >
                <Wand2 className="w-4 h-4" />
                Sign in with Magic Link
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300/50 dark:border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="px-3 text-slate-400">or</span></div>
            </div>

            <div className="text-center text-sm font-medium">
              {mode === 'login' ? (
                <p className="text-slate-500 dark:text-slate-400">
                  Don't have an account? {' '}
                  <button onClick={() => toggleMode('register')} className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 underline decoration-2 underline-offset-4">Sign up</button>
                </p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  Already have an account? {' '}
                  <button onClick={() => toggleMode('login')} className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 underline decoration-2 underline-offset-4">Sign in</button>
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthView;