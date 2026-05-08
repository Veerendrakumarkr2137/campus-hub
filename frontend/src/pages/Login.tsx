import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
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
        const { error } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password,
          options: { data: { role: 'STUDENT' } }
        });
        if (error) throw error;
        setErrorMsg('Signup successful! You can now log in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        navigate('/dashboard');
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            Campus Connect Hub
          </h1>
          <p className="text-slate-400 text-sm">Sign in to access your portal</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {errorMsg && (
            <div className={`p-3 rounded text-sm ${errorMsg.includes('successful') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="College Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full !pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full !pl-10 !pr-10"
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

          <div className="flex items-center justify-between text-sm">
            {!isSignUp && (
              <>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                  <span className="text-slate-300">Remember me</span>
                </label>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</a>
              </>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full flex items-center justify-center space-x-2 group"
          >
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
          <button onClick={() => setIsSignUp(!isSignUp)} type="button" className="text-emerald-400 hover:text-emerald-300">
            {isSignUp ? 'Sign in here' : 'Request access'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-slate-400">
          Are you an administrator?{' '}
          <button onClick={() => navigate('/admin-login')} type="button" className="text-red-400 hover:text-red-300 font-medium">
            Go to Admin Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
