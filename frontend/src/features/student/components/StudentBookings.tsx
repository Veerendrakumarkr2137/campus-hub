import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentBookings({ userId }: { userId: string }) {
  const [resources, setResources] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const { data: resData } = await supabase.from('resources').select('*').eq('is_active', true);
    if (resData) setResources(resData);

    const { data: bookData } = await supabase
      .from('bookings')
      .select('*, resources(name, type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (bookData) setMyBookings(bookData);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;
    
    setLoading(true);
    setMsg(null);

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      setMsg({ type: 'error', text: 'End Time must be after Start Time.' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('bookings').insert([{
        user_id: userId,
        resource_id: selectedResource,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        reason
      }]);
      if (error) throw error;
      setMsg({ type: 'success', text: 'Booking request submitted successfully!' });
      setSelectedResource('');
      setStartTime('');
      setEndTime('');
      setReason('');
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Booking Form */}
        <div className="lg:col-span-1">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 sticky top-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Booking</h2>
                <p className="text-slate-400 text-xs">Request lab or seminar hall access.</p>
              </div>
            </div>

            <form onSubmit={handleBook} className="space-y-5">
              <AnimatePresence>
                {msg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                  >
                    {msg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{msg.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Resource</label>
                  <select 
                    required 
                    value={selectedResource} 
                    onChange={e => setSelectedResource(e.target.value)} 
                    className="glass-input w-full bg-slate-900/50 text-sm py-2.5"
                  >
                    <option value="">Select a facility...</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id} className="bg-slate-900">
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Purpose</label>
                  <input 
                    required 
                    type="text" 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    className="glass-input w-full text-sm py-2.5" 
                    placeholder="e.g. Project Demo" 
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Starts</label>
                    <input 
                      required 
                      type="datetime-local" 
                      value={startTime} 
                      onChange={e => setStartTime(e.target.value)} 
                      className="glass-input w-full text-sm py-2.5" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ends</label>
                    <input 
                      required 
                      type="datetime-local" 
                      value={endTime} 
                      onChange={e => setEndTime(e.target.value)} 
                      className="glass-input w-full text-sm py-2.5" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="glass-button w-full bg-blue-600 hover:bg-blue-500 py-3 font-bold text-sm shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Processing...' : 'Request Booking'}
              </button>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-white/5">
                <div className="flex items-start space-x-2">
                  <Info className="w-3 h-3 text-blue-400 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Bookings are subject to administrative approval. You will be notified once reviewed.
                  </p>
                </div>
              </div>
            </form>
          </motion.section>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-400"/> Booking History
              </h2>
              <div className="flex items-center space-x-2">
                <div className="glass-panel px-3 py-1.5 flex items-center space-x-2">
                  <Search className="w-3 h-3 text-slate-500" />
                  <input type="text" placeholder="Filter..." className="bg-transparent border-none outline-none text-[10px] text-slate-300 w-24" />
                </div>
              </div>
            </div>

            {myBookings.length === 0 ? (
              <div className="glass-panel p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-700 mx-auto opacity-20" />
                <p className="text-slate-500 text-sm italic">You haven't made any bookings yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myBookings.map((b, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={b.id} 
                    className="glass-panel p-5 hover:bg-white/10 transition-all group relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${getStatusStyle(b.status)}`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-200">{b.resources?.name || 'Unknown Facility'}</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{b.resources?.type || 'RESOURCE'}</p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-slate-400">
                             <div className="flex items-center">
                               <Clock className="w-3 h-3 mr-1 text-blue-400" />
                               {new Date(b.start_time).toLocaleDateString()}
                             </div>
                             <div className="flex items-center">
                               {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(b.status)}`}>
                           {b.status}
                         </span>
                         <p className="text-[10px] text-slate-500 font-medium">Ref: #{b.id.slice(0,8)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                      <p className="text-xs text-slate-400 italic leading-relaxed">
                        Reason: <span className="text-slate-300 font-medium">"{b.reason}"</span>
                      </p>
                    </div>

                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                      <History className="w-24 h-24" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>

      </div>
    </div>
  );
}
