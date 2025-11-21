import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Camera, Loader2, LogOut, Save } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Account Settings</h1>

      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-dark-900/50 flex flex-col items-center">
           <div className="relative group cursor-pointer mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-dark-800 shadow-md">
                 <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-6 h-6 text-white" />
              </div>
           </div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white"
                 />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                 />
               </div>
               <p className="text-xs text-slate-500 pl-1">Email cannot be changed.</p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                 {message}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                 type="submit"
                 disabled={isLoading}
                 className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Save Changes
              </button>
              
              <button 
                 type="button"
                 onClick={() => logout()}
                 className="px-6 py-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
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