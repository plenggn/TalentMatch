import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfvblxpowzjvlhqshvst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdmJseHBvd3pqdmxocXNodnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDIxOTYsImV4cCI6MjA3NjExODE5Nn0.y49dji0wp9Lics2Wtg2nFD20UJifTZAKIhHIZAuf3cM'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
