import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    if (data) setComplaints(data);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('service_requests').update({ status }).eq('id', id);
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-emerald-400"/> Service Requests</h2>
      <div className="glass-panel overflow-hidden">
        {complaints.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm">No service requests found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {complaints.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-200">{c.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-400">{c.profiles?.email}</div>
                  </td>
                  <td className="p-4"><span className="px-2 py-1 bg-white/10 rounded text-xs">{c.category}</span></td>
                  <td className="p-4 max-w-xs truncate" title={c.description}>{c.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end space-x-2">
                    {c.status !== 'RESOLVED' && (
                      <button onClick={() => updateStatus(c.id, 'RESOLVED')} className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-emerald-500/20 rounded text-xs font-medium" title="Mark as Resolved">
                        Resolve
                      </button>
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
