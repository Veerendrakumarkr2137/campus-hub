import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  X, 
  Info, 
  Clock, 
  Calendar,
  Share2,
  Bell,
  BellOff,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentEvents({ initialEventId }: { initialEventId?: string | null }) {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [reminders, setReminders] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchReminders(user.id);
    }
  };

  const fetchReminders = async (userId: string) => {
    const { data } = await supabase
      .from('event_reminders')
      .select('event_id')
      .eq('user_id', userId);
    if (data) setReminders(data.map(r => r.event_id));
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (data) setEvents(data);
  };

  useEffect(() => {
    if (initialEventId && events.length > 0) {
      const event = events.find(e => e.id === initialEventId);
      if (event) setSelectedEvent(event);
    }
  }, [initialEventId, events]);

  const handleShare = async (event: any) => {
    const shareData = {
      title: event.title,
      text: `Check out this campus event: ${event.title} at ${event.location} on ${new Date(event.event_date).toLocaleDateString()}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Event details copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const toggleReminder = async (eventId: string) => {
    if (!user) return;

    const isReminded = reminders.includes(eventId);
    
    if (isReminded) {
      await supabase.from('event_reminders').delete().eq('user_id', user.id).eq('event_id', eventId);
      setReminders(prev => prev.filter(id => id !== eventId));
    } else {
      await supabase.from('event_reminders').insert({ user_id: user.id, event_id: eventId });
      setReminders(prev => [...prev, eventId]);
    }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <CalendarDays className="w-5 h-5 mr-2 text-purple-400"/> Upcoming Campus Events
      </h2>
      
      {events.length === 0 ? (
        <div className="glass-panel p-8 text-center text-slate-400">No upcoming events scheduled.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((e, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={e.id} 
              onClick={() => setSelectedEvent(e)}
              className="glass-panel p-6 hover:shadow-purple-500/20 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <CalendarDays className="w-24 h-24" />
              </div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-purple-400 transition-colors">{e.title}</h3>
                  {reminders.includes(e.id) && <Bell className="w-3 h-3 text-blue-400 animate-pulse" />}
                </div>
                <div className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-purple-500/30">
                  {new Date(e.event_date).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 relative z-10">{e.description}</p>
              
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 border-t border-white/10 pt-4 relative z-10">
                <span className="flex items-center group-hover:text-slate-300 transition-colors">
                  <MapPin className="w-3 h-3 mr-1 text-purple-400"/> {e.location || 'TBA'}
                </span>
                <span className="flex items-center group-hover:text-slate-300 transition-colors">
                  <Users className="w-3 h-3 mr-1 text-purple-400"/> {e.organizer || 'Campus Staff'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-lg overflow-hidden shadow-2xl border-white/20"
            >
              {/* Modal Header/Image Area */}
              <div className="h-32 bg-gradient-to-r from-purple-600/30 to-blue-600/30 relative">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/50 hover:bg-slate-900 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute -bottom-6 left-8 h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-xl border border-white/20">
                  <Info className="w-8 h-8" />
                </div>
              </div>

              <div className="p-8 pt-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-1">Official Campus Event</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleShare(selectedEvent)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Share Event"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleReminder(selectedEvent.id)}
                      className={`p-2 rounded-lg transition-colors ${reminders.includes(selectedEvent.id) ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}`}
                      title={reminders.includes(selectedEvent.id) ? 'Remove Reminder' : 'Set Reminder'}
                    >
                      {reminders.includes(selectedEvent.id) ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Date</p>
                      <p className="text-xs text-slate-200 font-semibold">{new Date(selectedEvent.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Time</p>
                      <p className="text-xs text-slate-200 font-semibold">10:00 AM onwards</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Location</p>
                      <p className="text-xs text-slate-200 font-semibold">{selectedEvent.location || 'Seminar Hall A'}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center space-x-3">
                    <Users className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Capacity</p>
                      <p className="text-xs text-slate-200 font-semibold">Open for All</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-purple-500 pl-3">About Event</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    "{selectedEvent.description}"
                  </p>
                </div>

                {reminders.includes(selectedEvent.id) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center text-xs text-blue-300"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Reminder set! You will receive an alert before the event.
                  </motion.div>
                )}

                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      if (selectedEvent.registration_link) {
                        window.open(selectedEvent.registration_link, '_blank');
                      } else {
                        alert('Registration link not provided for this event.');
                      }
                    }}
                    className="flex-1 glass-button bg-purple-600 hover:bg-purple-500 py-3 text-sm font-bold shadow-lg shadow-purple-500/20"
                  >
                    Register Now
                  </button>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 glass-button bg-white/5 hover:bg-white/10 py-3 text-sm font-bold border border-white/10"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
