import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qeekhvymbnbqxkgldwkw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZWtodnltYm5icXhrZ2xkd2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTU2NDksImV4cCI6MjA3OTMzMTY0OX0.4FBYIjKw9xUxcuSGCBAAwPoFI6wk9uMsk31OuJ2aNMg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);