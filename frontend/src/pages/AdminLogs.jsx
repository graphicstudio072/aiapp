import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Terminal, Search, Clock, Cpu, ArrowRight } from 'lucide-react';

const AdminLogs = () => {
  const { getAuthHeaders } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load system logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const actionMatch = l.action.toLowerCase().includes(searchQuery.toLowerCase());
    const detailsMatch = l.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const userMatch = l.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      l.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return actionMatch || detailsMatch || userMatch;
  });

  const formatLogAction = (action) => {
    return action.replace('USER_', '').replace('FILE_', '').replace('AI_', '').replace('ADMIN_', '').replace('_', ' ');
  };

  const getActionColor = (action) => {
    if (action.startsWith('ADMIN_')) return 'text-red-400 bg-red-500/10 border-red-500/10';
    if (action.startsWith('FILE_')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10';
    if (action.startsWith('AI_')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10';
    return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/10';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="text-red-400" size={24} />
            System Audit Trail
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Real-time system events, authentication records, and API interactions</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search audit trail logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all"
          />
        </div>
      </div>

      {/* Logs Shell Container */}
      <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-2xl bg-[#090a10]">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4 px-2 text-slate-400 text-xs font-mono">
          <Cpu size={14} className="text-indigo-400" />
          <span>telemetry@antigravity:~$ cat system.log | grep "{searchQuery || 'all'}"</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Module</th>
                <th className="p-3">User Target</th>
                <th className="p-3">Payload Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-600">
                    No matching activity logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-slate-500 text-[10px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[9px] uppercase font-bold tracking-wider ${getActionColor(log.action)}`}>
                        {formatLogAction(log.action)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                      {log.user ? (
                        <span>{log.user.email}</span>
                      ) : (
                        <span className="text-slate-600 font-semibold text-[10px] tracking-wide">SYSTEM INIT</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-200 leading-relaxed max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="p-3 text-slate-500 text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
