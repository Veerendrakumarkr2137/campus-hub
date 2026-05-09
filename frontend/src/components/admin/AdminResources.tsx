import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Layers, Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('ROOM');
  const [capacity, setCapacity] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    if (data) setResources(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('resources').insert([{ name, type, capacity: parseInt(capacity) }]);
    if (error) {
      alert("Error adding resource: " + error.message);
    } else {
      setName('');
      setCapacity('1');
      fetchResources();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    await supabase.from('resources').delete().eq('id', id);
    fetchResources();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('resources').update({ is_active: !currentStatus }).eq('id', id);
    fetchResources();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Plus className="w-5 h-5 mr-2 text-emerald-400"/> Add Resource</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="glass-input w-full" placeholder="e.g. Lab 3" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Type</label>
              <select required value={type} onChange={e => setType(e.target.value)} className="glass-input w-full bg-slate-900/50">
                <option className="bg-slate-900 text-slate-200" value="ROOM">Room / Hall</option>
                <option className="bg-slate-900 text-slate-200" value="LAB">Laboratory</option>
                <option className="bg-slate-900 text-slate-200" value="EQUIPMENT">Equipment</option>
                <option className="bg-slate-900 text-slate-200" value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Capacity</label>
              <input required type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} className="glass-input w-full" />
            </div>
            <button type="submit" disabled={loading} className="glass-button w-full bg-emerald-600/80 hover:bg-emerald-500/80">
              {loading ? 'Adding...' : 'Add Resource'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><Layers className="w-5 h-5 mr-2 text-blue-400"/> Manage Resources</h2>
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Capacity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {resources.map(r => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-slate-200">{r.name}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-white/10 rounded text-xs">{r.type}</span></td>
                  <td className="p-4 text-slate-300">{r.capacity}</td>
                  <td className="p-4">
                    <button onClick={() => toggleStatus(r.id, r.is_active)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${r.is_active ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'}`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 flex justify-end space-x-2">
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/20 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
