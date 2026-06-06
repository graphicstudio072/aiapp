import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Database, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';

const AdminDatabase = () => {
  const { getAuthHeaders } = useAuth();
  const [dbInfo, setDbInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purgeSuccess, setPurgeSuccess] = useState('');
  const [purgeLoading, setPurgeLoading] = useState(false);

  const fetchDbMetrics = async () => {
    try {
      const response = await fetch('/api/admin/database', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setDbInfo(data);
      }
    } catch (err) {
      console.error('Failed to load DB metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbMetrics();
  }, []);

  const handlePurgeLogs = async () => {
    if (!confirm('Are you sure you want to permanently delete all activity log entries older than 30 days? This frees up database space.')) return;

    setPurgeLoading(true);
    setPurgeSuccess('');
    
    try {
      const response = await fetch('/api/admin/database/purge-logs', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setPurgeSuccess(data.message);
        fetchDbMetrics();
      }
    } catch (err) {
      console.error('Failed to purge logs:', err);
    } finally {
      setPurgeLoading(false);
    }
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
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="text-indigo-400" size={24} />
          Database Monitoring
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">Real-time Mongoose MongoDB metrics, indexes, collections size, and cleanup routines</p>
      </div>

      {purgeSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle size={16} />
          <span>{purgeSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Connection State Info */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 h-fit">
          <h3 className="font-bold text-white text-base">Telemetry Status</h3>
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Connection Status</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold
                ${dbInfo?.dbState === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}
              `}>
                {dbInfo?.dbState || 'Disconnected'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">MongoDB Host</span>
              <span className="font-semibold text-slate-300 font-mono select-all break-all">{dbInfo?.host || 'Unknown'}</span>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-500 block">Driver Interface</span>
              <span className="font-semibold text-slate-300">Mongoose ORM</span>
            </div>
          </div>
        </div>

        {/* Collections Metrics */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <h3 className="font-bold text-white text-base">MongoDB Collections Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Collection Name</th>
                    <th className="pb-3 text-right">Document Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {dbInfo?.collections.map((col, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-semibold text-white">{col.name}</td>
                      <td className="py-3 text-right font-mono font-semibold text-indigo-300">{col.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Database Cleanup Routine */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 border-red-500/10 bg-red-950/5">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-white text-sm">Database Cleanup Tasks</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Delete old telemetry logs and audit trails. Performing this operation cleans up collections size, reduces memory footprint, and purges database history older than 30 days.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={handlePurgeLogs}
                disabled={purgeLoading}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold text-xs active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Trash2 size={13} />
                {purgeLoading ? 'Cleaning up...' : 'Purge Logs > 30 Days'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDatabase;
