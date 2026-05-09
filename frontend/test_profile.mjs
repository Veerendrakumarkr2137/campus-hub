import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ejhanuhrxmbjhwwpwhhg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaGFudWhyeG1iamh3d3B3aGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjA4MjIsImV4cCI6MjA5Mzc5NjgyMn0.fQXjTemnVSf9N6SQzda3pvYbdz-BTg7KS7aV2ruvj3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'admin_test6@college.edu',
    password: 'password123',
    options: { data: { role: 'ADMIN' } }
  });
  
  if (signUpError) {
    console.error('SignUp error:', signUpError.message);
    if (signUpError.message !== 'User already registered') {
       return;
    }
  } else {
    console.log('SignUp success:', signUpData.user.id);
  }

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin_test6@college.edu',
    password: 'password123'
  });
  
  if (loginError) {
    console.error('Login error:', loginError.message);
    return;
  }
  
  console.log('Login success:', loginData.user.id);

  // Try to manually insert profile if it doesn't exist
  const { data: profileCheck, error: profileCheckError } = await supabase.from('profiles').select('*').eq('id', loginData.user.id).single();
  if (!profileCheck) {
     console.log("Profile missing, trying to insert manually");
     const { data: insertData, error: insertError } = await supabase.from('profiles').insert([{
         id: loginData.user.id,
         email: 'admin_test6@college.edu',
         role: 'ADMIN'
     }]);
     if (insertError) {
         console.error('Insert error:', insertError);
     } else {
         console.log('Insert success');
     }
  } else {
     console.log('Profile exists:', profileCheck);
  }
}

run();
