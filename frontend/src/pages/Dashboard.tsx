import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Bell, LogOut, BookOpen, Clock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const stats = [
  { label: 'Upcoming Bookings', value: '3', icon: Calendar, color: 'text-blue-400' },
  { label: 'Open Requests', value: '1', icon: MessageSquare, color: 'text-emerald-400' },
  { label: 'New Announcements', value: '4', icon: Bell, color: 'text-purple-400' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUserEmail(user.email || 'Student');

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'ADMIN') {
        navigate('/admin');
        return;
      }

      // Fetch announcements
      const fetchAnnouncements = async () => {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!error && data) {
          setAnnouncements(data);
        }
      };
      
      fetchAnnouncements();
    };
    
    init();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Welcome back, {userEmail.split('@')[0]}!
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening on campus today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="glass-panel p-2 hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-slate-300" />
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg border border-white/20 uppercase">
            {userEmail ? userEmail[0] : 'U'}
          </div>
          <button 
            onClick={handleLogout}
            className="glass-panel p-2 hover:bg-white/10 transition-colors text-red-400"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-panel p-6 flex items-center space-x-4 hover:scale-105 transition-transform"
          >
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Left Column (Quick Actions & Announcements) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-400"/> Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Book Resource', icon: Calendar },
                { label: 'Raise Complaint', icon: MessageSquare },
                { label: 'View Schedule', icon: Clock },
                { label: 'Settings', icon: Settings },
              ].map((action, i) => (
                <button key={i} className="glass-panel p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 transition-all hover:-translate-y-1 group">
                  <action.icon className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Active Bookings */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-emerald-400"/> My Active Bookings</h2>
            <div className="glass-panel overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                  <tr>
                    <th className="p-4 font-medium">Resource</th>
                    <th className="p-4 font-medium">Time Slot</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr>
                    <td className="p-4">Seminar Hall A</td>
                    <td className="p-4">Today, 2:00 PM - 4:00 PM</td>
                    <td className="p-4"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-xs font-medium">Approved</span></td>
                  </tr>
                  <tr>
                    <td className="p-4">Projector 1</td>
                    <td className="p-4">Tomorrow, 10:00 AM</td>
                    <td className="p-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs font-medium">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Right Column (Announcements feed) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Bell className="w-5 h-5 mr-2 text-purple-400"/> Latest Announcements</h2>
          <div className="glass-panel p-6 h-full min-h-[400px]">
            <div className="space-y-6">
              {announcements.length === 0 ? (
                <p className="text-slate-400 text-sm">No announcements yet. Make sure to run the SQL seed in Supabase!</p>
              ) : (
                announcements.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                        Notice
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                    <div className="w-full h-px bg-white/5 mt-4 group-hover:bg-white/10 transition-colors"></div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All Announcements
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
