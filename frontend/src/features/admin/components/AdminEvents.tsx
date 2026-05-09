import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('events').insert([{
      title,
      event_date: new Date(date).toISOString(),
      description,
      location,
      organizer
    }]);
    
    if (error) {
      alert("Error adding event: " + error.message);
    } else {
      setTitle('');
      setDate('');
      setDescription('');
      setLocation('');
      setOrganizer('');
      fetchEvents();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Plus className="w-5 h-5 mr-2 text-purple-400"/> Add Event</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date & Time</label>
              <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Location</label>
              <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Organizer</label>
              <input type="text" value={organizer} onChange={e => setOrganizer(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="glass-input w-full h-24 resize-none" />
            </div>
            <button type="submit" disabled={loading} className="glass-button w-full bg-purple-600/80 hover:bg-purple-500/80">
              {loading ? 'Adding...' : 'Add Event'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-purple-400"/> Manage Events</h2>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="glass-panel p-6 text-slate-400 text-sm">No events found.</div>
          ) : (
            events.map((e, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={e.id} 
                className="glass-panel p-6 hover:bg-white/5 transition-all flex justify-between items-start group"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">{e.title}</h3>
                  <div className="text-sm text-purple-300 mb-2">
                    {new Date(e.event_date).toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{e.description}</p>
                  <div className="text-xs text-slate-500">
                    <span className="mr-4"><strong>Location:</strong> {e.location}</span>
                    <span><strong>Organizer:</strong> {e.organizer}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(e.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
