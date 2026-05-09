import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { user, profile, loading: authLoadingGlobal } = useAuth();
  const [email, setEmail] = useState(import.meta.env.VITE_USER_EMAIL || '');
  const [password, setPassword] = useState(import.meta.env.VITE_USER_PASSWORD || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile && !authLoadingGlobal) {
      if (profile.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, authLoadingGlobal, navigate]);

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
          options: { 
            data: { 
              full_name: cleanEmail.split('@')[0]
            } 
          }
        });
        if (error) throw error;
        setErrorMsg('Signup successful! You can now log in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        // Navigation is handled by the useEffect above
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
          <p className="text-slate-400 text-sm font-medium">Enterprise Smart Campus Portal</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {errorMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${errorMsg.includes('successful') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
               <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${errorMsg.includes('successful') ? 'bg-emerald-500' : 'bg-red-500'}`} />
               <span>{errorMsg}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                placeholder="College Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full !pl-10 text-sm py-3"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full !pl-10 !pr-10 text-sm py-3"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {!isSignUp && (
              <>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="rounded-md border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                  <span className="group-hover:text-slate-300 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">Recover Password</a>
              </>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full flex items-center justify-center space-x-2 group py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
          >
            <span>{loading ? 'Authenticating...' : isSignUp ? 'Initialize Account' : 'Secure Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          {!isSignUp && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
                  <span className="bg-[#0f172a] px-4 text-slate-500 font-bold">Or Continue With</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin }
                  });
                }}
                className="glass-button w-full flex items-center justify-center space-x-3 py-3.5 bg-white/5 hover:bg-white/10 border-white/10 text-sm font-bold tracking-tight transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-slate-200">Connect with Google</span>
              </button>
            </>
          )}
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-xs text-slate-500 mb-4">
             {isSignUp ? 'Already a member?' : "New to the platform?"}
           </p>
           <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            type="button" 
            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all"
           >
            {isSignUp ? 'Back to Login' : 'Request Access'}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-2 opacity-20 group hover:opacity-50 transition-opacity pointer-events-none">
           <Shield className="w-4 h-4 text-slate-400" />
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">256-bit Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
