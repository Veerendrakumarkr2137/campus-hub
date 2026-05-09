import { motion } from 'framer-motion';
import { Users, Calendar, Megaphone, CheckSquare, LogOut, Settings, LayoutDashboard, Layers, CalendarDays, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminStudents from '../components/AdminStudents';
import AdminResources from '../components/AdminResources';
import AdminBookings from '../components/AdminBookings';
import AdminComplaints from '../components/AdminComplaints';
import AdminEvents from '../components/AdminEvents';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { label: 'Pending Bookings', value: '5', icon: CheckSquare, color: 'text-amber-400' },
  { label: 'Active Students', value: '124', icon: Users, color: 'text-blue-400' },
  { label: 'Resources', value: '12', icon: Layers, color: 'text-emerald-400' },
];

export default function AdminDashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const activeTab = tab || 'overview';

  useEffect(() => {
    if (user && profile) {
      if (profile.role !== 'ADMIN') {
        navigate('/dashboard');
        return;
      }
      setUserEmail(user.email || 'Admin');
      fetchAnnouncements();
    }
  }, [user, profile, navigate]);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5);
    if (data) setAnnouncements(data);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('announcements').insert([{ title: newTitle, content: newContent, author_id: user.id }]);
    if (error) {
      alert("Error posting announcement: " + error.message);
    } else {
      setNewTitle('');
      setNewContent('');
      fetchAnnouncements();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'resources', label: 'Resources', icon: Layers },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'events', label: 'Events', icon: CalendarDays },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
            Admin Portal
          </h1>
          <p className="text-slate-400 mt-1">Manage campus operations and resources.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg border border-white/20 uppercase">
            {userEmail ? userEmail[0] : 'A'}
          </div>
          <button onClick={handleLogout} className="glass-panel p-2 hover:bg-white/10 transition-colors text-red-400" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-white/10">
        {tabs.map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => navigate(`/admin/${tabItem.id}`)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tabItem.id 
                ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tabItem.icon className="w-4 h-4" />
            <span className="font-medium text-sm">{tabItem.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass-panel p-6 flex items-center space-x-4 hover:scale-105 transition-transform">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Post Announcement */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center"><Megaphone className="w-5 h-5 mr-2 text-blue-400"/> Broadcast Update</h2>
                <form onSubmit={postAnnouncement} className="glass-panel p-6 space-y-4">
                  <input type="text" placeholder="Announcement Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="glass-input w-full" required />
                  <textarea placeholder="Announcement Content" value={newContent} onChange={(e) => setNewContent(e.target.value)} className="glass-input w-full h-32 resize-none" required />
                  <button type="submit" className="glass-button w-full bg-red-600/80 hover:bg-red-500/80 border-red-400/30">Post to Dashboard</button>
                </form>
              </section>

              {/* Recent Announcements */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center"><CheckSquare className="w-5 h-5 mr-2 text-emerald-400"/> Recent Broadcasts</h2>
                <div className="glass-panel p-6 h-[270px] overflow-y-auto space-y-4">
                  {announcements.length === 0 ? <p className="text-slate-400 text-sm">No announcements yet.</p> : announcements.map((item) => (
                    <div key={item.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                      <h3 className="font-medium text-slate-200">{item.title}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                      <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'students' && <AdminStudents />}
        {activeTab === 'resources' && <AdminResources />}
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'complaints' && <AdminComplaints />}
        {activeTab === 'events' && <AdminEvents />}
      </div>
    </div>
  );
}
