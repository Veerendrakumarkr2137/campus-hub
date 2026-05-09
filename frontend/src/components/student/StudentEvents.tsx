import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentEvents() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (data) setEvents(data);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-purple-400"/> Upcoming Campus Events</h2>
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
              className="glass-panel p-6 hover:shadow-purple-500/10 hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-200">{e.title}</h3>
                <div className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium">
                  {new Date(e.event_date).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-3">{e.description}</p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/10 pt-4">
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {e.location || 'TBA'}</span>
                <span className="flex items-center"><Users className="w-3 h-3 mr-1"/> {e.organizer || 'Campus Staff'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
