import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  Bell, 
  LogOut,
  BellRing,
  ExternalLink,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import StudentProfile from '../components/StudentProfile';
import StudentBookings from '../components/StudentBookings';
import StudentComplaints from '../components/StudentComplaints';
import StudentEvents from '../components/StudentEvents';
import { useAuth } from '@/context/AuthContext';

export default function StudentDashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const activeTab = tab || 'overview';
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchNotifications = async (id: string) => {
    try {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(5);
      if (data) setNotifications(data);
    } catch (e) {
      console.warn('Notifications table might be missing:', e);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
      if (data) setAnnouncements(data);
    } catch (e) {
      console.warn('Announcements table might be missing:', e);
    }
  };

  useEffect(() => {
    console.log('[StudentDashboard] State Check - User:', user?.email, 'Profile:', profile?.role);
    if (user && profile) {
      setUserId(user.id);
      setUserEmail(user.email || '');
      setUserName(profile.full_name || user.email?.split('@')[0]);
      fetchNotifications(user.id);
      fetchAnnouncements();
      
      // Setup realtime subscription
      const channel = supabase.channel(`notifications-${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        }, () => fetchNotifications(user.id))
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, profile]);

  if (!user || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-2 border-t-blue-500 border-white/10 animate-spin"></div>
      </div>
    );
  }

  const refreshProfile = async () => {
     const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
     if (profile) setUserName(profile.full_name || userEmail.split('@')[0]);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'events', label: 'Events', icon: LayoutGrid },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full min-h-screen">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div className="flex-1 min-w-0 pr-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 truncate tracking-tight"
          >
            Welcome back, {userName}!
          </motion.h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base font-medium">Monitoring your campus status and updates.</p>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4 shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 md:p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative group"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-blue-500 rounded-full border-2 border-[#0f172a] group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                   key="notifications-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-72 md:w-80 glass-panel z-[1000] overflow-hidden border-white/20 shadow-2xl"
                >
                  <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center">
                      <BellRing className="w-4 h-4 mr-2 text-blue-400" /> Notifications
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{notifications.length} Recent</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs italic">All caught up!</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={async () => {
                             await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
                             setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
                             if (n.message.toLowerCase().includes('event') || n.message.toLowerCase().includes('hackathon')) {
                                navigate('/dashboard/events');
                                setShowNotifications(false);
                             }
                          }}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                        >
                          <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg border border-white/10 shadow-lg">
            {userName[0]?.toUpperCase()}
          </div>
          
          <button 
            onClick={async () => { await signOut(); navigate('/'); }}
            className="p-2.5 md:p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Responsive Tab Nav */}
      <nav className="flex space-x-2 md:space-x-4 mb-8 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => { navigate(`/dashboard/${tabItem.id}`); setSelectedEventId(null); }}
            className={`flex items-center px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap border ${
              activeTab === tabItem.id 
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' 
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <tabItem.icon className={`w-4 h-4 mr-2.5 ${activeTab === tabItem.id ? 'text-white' : 'text-slate-500'}`} />
            {tabItem.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Announcements Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
                    <BellRing className="w-5 h-5 mr-3 text-blue-400" /> Key Announcements
                  </h3>
                  <button className="text-[10px] font-bold text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors">View All Archive</button>
                </div>
                
                {announcements.length === 0 ? (
                  <div className="glass-panel p-12 text-center text-slate-500 text-sm italic">No active announcements.</div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((a, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={a.id} 
                        className="glass-panel p-6 hover:bg-white/10 transition-all group border-white/5 hover:border-blue-500/30"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                               A
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{a.title}</h4>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-white/10 pl-4">{a.content}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions / Stats Sidebar */}
              <div className="space-y-6">
                <div className="glass-panel p-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
                   <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                      </div>
                      <h4 className="font-bold text-white text-sm">Campus Quick Links</h4>
                   </div>
                   <div className="space-y-3">
                      {[
                        { label: 'Academic Calendar', url: '#' },
                        { label: 'E-Library Access', url: '#' },
                        { label: 'Fee Payment Portal', url: '#' },
                      ].map((link, idx) => (
                        <a key={idx} href={link.url} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 transition-all group">
                           <span>{link.label}</span>
                           <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ))}
                   </div>
                </div>

                <div className="glass-panel p-6 border-white/5">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Account Integrity</h4>
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Security Score</span>
                      <span className="text-xs font-bold text-emerald-400">Optimal</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && <StudentProfile userEmail={userEmail} userId={userId} onUpdate={refreshProfile} />}
          {activeTab === 'bookings' && <StudentBookings userId={userId} />}
          {activeTab === 'complaints' && <StudentComplaints userId={userId} />}
          {activeTab === 'events' && <StudentEvents initialEventId={selectedEventId} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
