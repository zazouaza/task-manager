import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Loader2, LogOut, Save, Shield } from 'lucide-react';

const ProfileView: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      await updateUser({ name });
      setMessage('Profile updated successfully!');
    } catch (e) {
      setMessage('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
      </div>

      <div className="glass-panel rounded-[2rem] overflow-hidden shadow-xl border border-white/40 dark:border-white/10">
        {/* Header Section */}
        <div className="p-10 border-b border-white/20 dark:border-white/5 flex flex-col md:flex-row items-center gap-8 bg-white/30 dark:bg-white/5 backdrop-blur-md">
           <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-400 shadow-2xl flex items-center justify-center text-4xl font-black text-white border-4 border-white/30 dark:border-white/10">
              {user.name.charAt(0).toUpperCase()}
           </div>
           <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mt-1">{user.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm">
                 <Shield className="w-3.5 h-3.5" /> Verified Member
              </div>
           </div>
        </div>

        <div className="p-10 md:p-12 bg-white/20 dark:bg-black/20">
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                   <div className="relative group">
                     <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                     <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/60 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-2xl py-4 pl-14 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white font-semibold backdrop-blur-sm shadow-sm"
                     />
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input 
                        type="email" 
                        value={user.email}
                        disabled
                        className="w-full bg-slate-100/50 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl py-4 pl-14 pr-4 text-slate-500 dark:text-slate-500 cursor-not-allowed font-semibold"
                     />
                   </div>
                </div>
            </div>

            {message && (
              <div className={`p-5 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-lg ${message.includes('Success') ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30'}`}>
                 {message}
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-white/10">
              <button 
                 type="submit"
                 disabled={isLoading}
                 className="flex-1 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
              >
                 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Save Changes
              </button>
              
              <button 
                 type="button"
                 onClick={() => logout()}
                 className="px-8 py-4 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                 <LogOut className="w-5 h-5" />
                 Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;