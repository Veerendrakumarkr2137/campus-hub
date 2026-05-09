import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const cleanEmail = email.trim();
      if (isSignUp) {
        // Automatically assign ADMIN role for this testing portal
        const { error } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password,
          options: { data: { role: 'ADMIN' } }
        });
        if (error) throw error;
        setErrorMsg('Admin account created! Please sign in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        
        // Verify they are actually an admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
           const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
           
           if (profileError) {
               console.error("Profile check error:", profileError);
           }

           const role = profile?.role || user.user_metadata?.role;

           if (role !== 'ADMIN') {
               await supabase.auth.signOut();
               throw new Error("Access Denied: You do not have Administrator privileges.");
           }
        }
        
        navigate('/admin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md p-8 relative overflow-hidden border-red-500/30"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-red-500/20 p-3 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400 mb-2">
            Admin Portal
          </h1>
          <p className="text-slate-400 text-sm">Secure access for campus administrators</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {errorMsg && (
            <div className={`p-3 rounded text-sm ${errorMsg.includes('created') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full !pl-10 focus:ring-red-500/50"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full !pl-10 !pr-10 focus:ring-red-500/50"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full flex items-center justify-center space-x-2 group bg-red-600/80 hover:bg-red-500/80 border-red-400/30 hover:shadow-red-500/25"
          >
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Admin Account' : 'Secure Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-400">
          <button onClick={() => setIsSignUp(!isSignUp)} type="button" className="text-amber-400 hover:text-amber-300 underline">
            {isSignUp ? 'Back to Sign In' : 'Create Admin Account (Test Mode)'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-slate-400">
          Are you a student?{' '}
          <button onClick={() => navigate('/login')} type="button" className="text-blue-400 hover:text-blue-300 font-medium">
            Go to Student Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
