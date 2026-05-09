import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function StudentComplaints({ userId }: { userId: string }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [category, setCategory] = useState('MAINTENANCE');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [userId]);

  const fetchComplaints = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setComplaints(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const { error } = await supabase.from('service_requests').insert([{
        user_id: userId,
        category,
        description
      }]);
      if (error) throw error;
      setMsg('Complaint raised successfully!');
      setDescription('');
      fetchComplaints();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="glass-panel p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-emerald-400"/> Raise a Complaint / Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && <div className={`p-3 rounded text-sm ${msg.includes('Error') ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{msg}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select required value={category} onChange={e => setCategory(e.target.value)} className="glass-input w-full bg-slate-900/50">
                <option className="bg-slate-900 text-slate-200" value="MAINTENANCE">Maintenance</option>
                <option className="bg-slate-900 text-slate-200" value="IT_SUPPORT">IT Support</option>
                <option className="bg-slate-900 text-slate-200" value="CLEANING">Cleaning & Hygiene</option>
                <option className="bg-slate-900 text-slate-200" value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="glass-input w-full h-32 resize-none" placeholder="Provide details about the issue..." />
          </div>
          <button type="submit" disabled={loading} className="glass-button w-full md:w-auto px-8 bg-emerald-600/80 hover:bg-emerald-500/80">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Requests History</h2>
        <div className="glass-panel overflow-hidden">
          {complaints.length === 0 ? (
            <p className="p-6 text-slate-400 text-sm">No requests found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {complaints.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-white/10 rounded text-xs">{c.category}</span></td>
                    <td className="p-4 max-w-xs truncate" title={c.description}>{c.description}</td>
                    <td className="p-4 flex items-center space-x-2">
                      {c.status === 'RESOLVED' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                      <span className={`text-xs font-medium ${c.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {c.status}
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
