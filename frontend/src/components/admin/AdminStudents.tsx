import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Mail, Clock } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'STUDENT')
      .order('created_at', { ascending: false });
    if (data) setStudents(data);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-blue-400"/> Student Records</h2>
      <div className="glass-panel overflow-hidden">
        {students.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm">No students found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">Full Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-slate-200">{s.full_name || 'N/A'}</td>
                  <td className="p-4 flex items-center space-x-2 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{s.email}</span>
                  </td>
                  <td className="p-4 text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
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
