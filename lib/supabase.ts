
import { createClient } from '@supabase/supabase-js';

// Try to get env vars from common frameworks (Vite, Create React App, Next.js)
const supabaseUrl = 
  process.env.REACT_APP_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  'https://qeekhvymbnbqxkgldwkw.supabase.co';

const supabaseAnonKey = 
  process.env.REACT_APP_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZWtodnltYm5icXhrZ2xkd2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTU2NDksImV4cCI6MjA3OTMzMTY0OX0.4FBYIjKw9xUxcuSGCBAAwPoFI6wk9uMsk31OuJ2aNMg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Authentication will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
