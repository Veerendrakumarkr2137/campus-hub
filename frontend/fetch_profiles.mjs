import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ejhanuhrxmbjhwwpwhhg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaGFudWhyeG1iamh3d3B3aGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjA4MjIsImV4cCI6MjA5Mzc5NjgyMn0.fQXjTemnVSf9N6SQzda3pvYbdz-BTg7KS7aV2ruvj3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  console.log('Profiles:', data);
  if (error) console.error('Error:', error);
}

run();
