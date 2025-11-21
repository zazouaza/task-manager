import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle, Github, Command } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

const AuthView: React.FC = () => {
  const { login, register } = useAuth();
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
        await register(email, password, name);
      } else {
        // Mock forgot password
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccess('If an account exists, a reset link has been sent.');
        setIsLoading(false);
        return; // Stay on forgot page to show message
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    // Keep email if switching modes for better UX
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 md:p-8 animate-in fade-in duration-500">
      
      <div className="w-full max-w-4xl bg-white dark:bg-dark-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Branding / Info */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-indigo-800 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 0 L100 0 L100 100 Z" fill="white" />
             </svg>
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/30">
              <Command className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">Organize your work with AI power.</h1>
            <p className="text-indigo-100 text-lg">Turn chaos into clarity. TaskFlow uses Gemini AI to parse your natural thoughts into actionable plans.</p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-indigo-100">
              <CheckCircle className="w-5 h-5" />
              <span>Natural Language Processing</span>
            </div>
            <div className="flex items-center gap-3 text-indigo-100">
              <CheckCircle className="w-5 h-5" />
              <span>Smart Categorization</span>
            </div>
            <div className="flex items-center gap-3 text-indigo-100">
              <CheckCircle className="w-5 h-5" />
              <span>Secure Cloud Sync</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          
          <div className="md:hidden flex items-center gap-2 mb-8">
             <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
               <Command className="w-4 h-4" />
             </div>
             <span className="text-xl font-bold text-slate-900 dark:text-white">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an account' : 'Reset Password'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'Please enter your details.' : mode === 'register' ? 'Get started with your free account.' : 'Enter your email to receive instructions.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                  />
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => toggleMode('forgot')}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-sm">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                  {mode !== 'forgot' && <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-dark-900 text-slate-500">Or continue with</span></div>
              </div>

              <button type="button" className="w-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700 transition-all flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>
            </>
          )}

          <div className="mt-8 text-center text-sm">
            {mode === 'login' ? (
              <p className="text-slate-500">
                Don't have an account? {' '}
                <button onClick={() => toggleMode('register')} className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400">Sign up</button>
              </p>
            ) : (
              <p className="text-slate-500">
                Already have an account? {' '}
                <button onClick={() => toggleMode('login')} className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400">Sign in</button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthView;