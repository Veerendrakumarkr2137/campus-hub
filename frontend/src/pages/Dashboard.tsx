import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Bell, LogOut, BookOpen, Clock, Settings, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StudentBookings from '../components/student/StudentBookings';
import StudentComplaints from '../components/student/StudentComplaints';
import StudentEvents from '../components/student/StudentEvents';

export default function Dashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUserEmail(user.email || 'Student');
      setUserId(user.id);

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || user.user_metadata?.role || 'STUDENT';

      // Auto-heal: If profile is missing (due to trigger failure), create it now
      if (!profile) {
        await supabase.from('profiles').insert([{
          id: user.id,
          email: user.email,
          role: role
        }]);
      }

      if (role === 'ADMIN') {
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Resource Booking', icon: Calendar },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'events', label: 'Events', icon: Bell },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Welcome back, {userEmail.split('@')[0]}!
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening on campus today.</p>
        </div>
        <div className="flex items-center space-x-4">
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

      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-400"/> Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('bookings')} className="glass-panel p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 transition-all hover:-translate-y-1 group">
                    <Calendar className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium">Book Resource</span>
                  </button>
                  <button onClick={() => setActiveTab('complaints')} className="glass-panel p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 transition-all hover:-translate-y-1 group">
                    <MessageSquare className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium">Raise Complaint</span>
                  </button>
                  <button onClick={() => setActiveTab('events')} className="glass-panel p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 transition-all hover:-translate-y-1 group">
                    <Bell className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium">View Events</span>
                  </button>
                  <button className="glass-panel p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 transition-all hover:-translate-y-1 group">
                    <Settings className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><Bell className="w-5 h-5 mr-2 text-purple-400"/> Latest Announcements</h2>
              <div className="glass-panel p-6 min-h-[400px]">
                <div className="space-y-6">
                  {announcements.length === 0 ? (
                    <p className="text-slate-400 text-sm">No announcements yet.</p>
                  ) : (
                    announcements.map((item) => (
                      <div key={item.id} className="group">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300">Notice</span>
                          <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-medium text-slate-200">{item.title}</h3>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                        <div className="w-full h-px bg-white/5 mt-4"></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && <StudentBookings userId={userId} />}
        {activeTab === 'complaints' && <StudentComplaints userId={userId} />}
        {activeTab === 'events' && <StudentEvents />}
      </div>
    </div>
  );
}
