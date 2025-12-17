import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!');
    console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? 'Present' : 'Missing');
    console.error('VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');
}

export const supabase = createClient(
    SUPABASE_URL || 'https://dummy.supabase.co',
    SUPABASE_ANON_KEY || 'dummy-key'
);



