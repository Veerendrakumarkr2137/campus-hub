import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  FileCheck, 
  Edit2, 
  Check, 
  X,
  Briefcase,
  IdCard,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StudentProfile({ userEmail, userId, onUpdate }: { userEmail: string; userId: string; onUpdate?: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: '',
    college_id: '',
    department: '',
  });

  const [editForm, setEditForm] = useState({ ...profile });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, college_id, department')
        .eq('id', userId)
        .single();

      if (data) {
        const profileData = {
          full_name: data.full_name || userEmail.split('@')[0],
          college_id: data.college_id || '',
          department: data.department || 'Not Assigned',
        };
        setProfile(profileData);
        setEditForm(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          college_id: editForm.college_id,
          department: editForm.department,
        })
        .eq('id', userId);

      if (error) throw error;
      
      setProfile({ ...editForm });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Update failed. Ensure database schema is ready.');
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { id: 1, name: 'ID Card Verification', status: 'Completed', icon: IdCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 2, name: 'Academic Registration', status: 'Pending', icon: GraduationCap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 3, name: 'Safety Training 2024', status: 'In Progress', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 4, name: 'Library Clearance', status: 'Completed', icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Identity Section */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12">
              <User className="w-48 h-48" />
            </div>

            <button 
              onClick={() => {
                if (isEditing) setEditForm({ ...profile });
                setIsEditing(!isEditing);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white z-20 border border-white/5"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>

            <div className="relative inline-block mb-6">
              <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white/10">
                {profile.full_name[0]?.toUpperCase() || userEmail[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-4 border-[#0f172a] flex items-center justify-center shadow-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="editing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-left relative z-10"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="glass-input w-full text-sm py-3"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">College ID</label>
                      <input 
                        type="text" 
                        value={editForm.college_id}
                        onChange={(e) => setEditForm({ ...editForm, college_id: e.target.value })}
                        className="glass-input w-full text-sm py-3"
                        placeholder="e.g. CS2024001"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
                      <input 
                        type="text" 
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="glass-input w-full text-sm py-3"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="glass-button w-full bg-emerald-600 hover:bg-emerald-500 py-4 font-bold text-sm shadow-xl shadow-emerald-500/20"
                  >
                    {loading ? 'Updating...' : 'Save Profile'}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="viewing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative z-10"
                >
                  <h2 className="text-2xl font-black text-white tracking-tight">{profile.full_name}</h2>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">Verified Student</p>
                  
                  <div className="space-y-3 text-left">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3 group hover:bg-white/10 transition-colors">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Email Address</p>
                        <p className="text-xs text-slate-200 truncate">{userEmail}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3 group hover:bg-white/10 transition-colors">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">College ID</p>
                        <p className="text-xs text-slate-200">{profile.college_id || 'Not Assigned'}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3 group hover:bg-white/10 transition-colors">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Department</p>
                        <p className="text-xs text-slate-200">{profile.department}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Compliance & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 h-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <FileCheck className="w-6 h-6 mr-3 text-blue-400" /> Compliance Hub
                </h3>
                <p className="text-slate-400 text-sm mt-1">Status of your campus prerequisites.</p>
              </div>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      U{i}
                    </div>
                 ))}
                 <div className="h-8 w-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                    S4
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {requirements.map((req) => (
                <div key={req.id} className="p-5 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-2xl ${req.bg} flex items-center justify-center ${req.color} group-hover:rotate-6 transition-transform`}>
                      <req.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{req.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${req.color}`}>
                        {req.status}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-3xl bg-gradient-to-tr from-blue-500/10 to-purple-500/10 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                   <ShieldAlert className="w-4 h-4 text-blue-400" />
                   <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">Academic Progress Meter</span>
                </div>
                <span className="text-xl font-black text-blue-400">75%</span>
              </div>
              <div className="h-3 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"
                />
              </div>
              <p className="mt-4 text-[10px] text-slate-500 leading-relaxed italic">
                You are currently <span className="text-blue-300">compliant</span> with all major campus safety and academic registration protocols.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
