import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, email), resources(name)')
      .order('created_at', { ascending: false });
    if (data) setBookings(data);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-400"/> Booking Requests</h2>
      <div className="glass-panel overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm">No bookings found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Resource</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-200">{b.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-400">{b.profiles?.email}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-300">{b.resources?.name}</td>
                  <td className="p-4">
                    {new Date(b.start_time).toLocaleString()} <br/>
                    <span className="text-slate-500 text-xs">to {new Date(b.end_time).toLocaleTimeString()}</span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-[200px] truncate" title={b.reason}>{b.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : b.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end space-x-2">
                    {b.status === 'PENDING' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'APPROVED')} className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-emerald-500/20 rounded" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus(b.id, 'REJECTED')} className="p-2 text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-red-500/20 rounded" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
