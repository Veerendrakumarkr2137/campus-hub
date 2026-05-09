import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ejhanuhrxmbjhwwpwhhg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaGFudWhyeG1iamh3d3B3aGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjA4MjIsImV4cCI6MjA5Mzc5NjgyMn0.fQXjTemnVSf9N6SQzda3pvYbdz-BTg7KS7aV2ruvj3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'admin_test123@college.edu',
    password: 'password123',
    options: { data: { role: 'ADMIN' } }
  });
  
  if (signUpError) {
    console.error('SignUp error:', signUpError.message);
  } else {
    console.log('SignUp success:', signUpData.user.id);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin_test123@college.edu',
    password: 'password123'
  });
  
  if (error) {
    console.error('Login error:', error.message);
  } else {
    console.log('Login success:', data.user.id);
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    if (profileError) {
      console.error('Profile error:', profileError);
    } else {
      console.log('Profile:', profile);
    }
  }
}

run();
