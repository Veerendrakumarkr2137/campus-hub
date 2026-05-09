import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function StudentBookings({ userId }: { userId: string }) {
  const [resources, setResources] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const { data: resData } = await supabase.from('resources').select('*').eq('is_active', true);
    if (resData) setResources(resData);

    const { data: bookData } = await supabase
      .from('bookings')
      .select('*, resources(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (bookData) setMyBookings(bookData);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      setMsg('Error: End Time must be after Start Time.');
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
      setMsg('Booking request submitted successfully!');
      setSelectedResource('');
      setStartTime('');
      setEndTime('');
      setReason('');
      fetchData();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <section className="glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-400"/> Request Resource Booking</h2>
        <form onSubmit={handleBook} className="space-y-4">
          {msg && <div className={`p-3 rounded text-sm ${msg.includes('Error') ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{msg}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Resource</label>
              <select required value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="glass-input w-full bg-slate-900/50">
                <option className="bg-slate-900 text-slate-200" value="">Select a resource...</option>
                {resources.map(r => <option className="bg-slate-900 text-slate-200" key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Reason for Booking</label>
              <input required type="text" value={reason} onChange={e => setReason(e.target.value)} className="glass-input w-full" placeholder="e.g. Project Presentation" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Time</label>
              <input required type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">End Time</label>
              <input required type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="glass-input w-full" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="glass-button w-full md:w-auto px-8 bg-blue-600/80 hover:bg-blue-500/80">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Bookings History</h2>
        <div className="glass-panel overflow-hidden">
          {myBookings.length === 0 ? (
            <p className="p-6 text-slate-400 text-sm">No bookings found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                <tr>
                  <th className="p-4 font-medium">Resource</th>
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Reason</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {myBookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">{b.resources?.name || 'Unknown'}</td>
                    <td className="p-4">
                      {new Date(b.start_time).toLocaleString()} <br/>
                      <span className="text-slate-500 text-xs">to {new Date(b.end_time).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4">{b.reason}</td>
                    <td className="p-4 flex items-center space-x-2">
                      {getStatusIcon(b.status)}
                      <span className={`text-xs font-medium ${b.status === 'APPROVED' ? 'text-emerald-400' : b.status === 'REJECTED' ? 'text-red-400' : 'text-amber-400'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
