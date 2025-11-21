
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
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an account' : 'Magic Link Login'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'Please enter your details.' : mode === 'register' ? 'Get started with your free account.' : 'We will email you a link to sign in instantly.'}
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

            {mode !== 'magic-link' && (
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
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Magic Link'}
                  {mode !== 'magic-link' && <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {mode === 'login' && (
              <button 
                type="button"
                onClick={() => toggleMode('magic-link')}
                className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium py-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-2 border border-dashed border-indigo-200 dark:border-indigo-800"
              >
                <Wand2 className="w-4 h-4" />
                Sign in with Magic Link
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-dark-900 text-slate-500">or</span></div>
            </div>

            <div className="text-center text-sm">
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
    </div>
  );
};

export default AuthView;
