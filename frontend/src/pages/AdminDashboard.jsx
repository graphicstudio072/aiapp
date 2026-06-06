import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import StatsCard from '../components/StatsCard.jsx';
import { Users, MessageSquare, FileText, Database, Shield, Activity, HardDrive } from 'lucide-react';

const AdminDashboard = () => {
  const { getAuthHeaders } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: getAuthHeaders()
      });
      const resData = await response.json();
      if (resData.success) {
        setData(resData.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate percentage for SVG charts
  const totalUsersCount = data?.users.total || 0;
  const activePct = totalUsersCount ? Math.round((data.users.active / totalUsersCount) * 100) : 0;
  const suspendedPct = totalUsersCount ? Math.round((data.users.suspended / totalUsersCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-red-400" size={24} />
          Administration Hub
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">Global system telemetry, users oversight, and file allocations</p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Accounts"
          value={totalUsersCount}
          icon={Users}
          description={`${data?.users.active} active / ${data?.users.suspended} suspended`}
          color="indigo"
        />
        <StatsCard
          title="Total Chats"
          value={data?.conversations || 0}
          icon={MessageSquare}
          description="Total conversations initiated"
          color="cyan"
        />
        <StatsCard
          title="Documents"
          value={data?.files.count || 0}
          icon={FileText}
          description="Files currently stored"
          color="emerald"
        />
        <StatsCard
          title="Storage Utilized"
          value={`${data?.files.sizeMB.toFixed(2)} MB`}
          icon={HardDrive}
          description="Physical disk allocation"
          color="violet"
        />
      </div>

      {/* Analytics Charts Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User Status Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Users className="text-indigo-400" size={18} />
            Account Distribution Status
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
            {/* Custom SVG Pie Chart */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
                {/* Active Segment */}
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="4" 
                  strokeDasharray={`${activePct} ${100 - activePct}`} 
                  strokeDashoffset="0"
                ></circle>
                {/* Suspended Segment */}
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="4" 
                  strokeDasharray={`${suspendedPct} ${100 - suspendedPct}`} 
                  strokeDashoffset={-activePct}
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{activePct}%</span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Active</span>
              </div>
            </div>

            {/* Labels and Metrics */}
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-brandPurple shrink-0"></span>
                    <span>Active User Accounts</span>
                  </div>
                  <span className="font-semibold text-white">{data?.users.active}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brandPurple rounded-full" style={{ width: `${activePct}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                    <span>Suspended Accounts</span>
                  </div>
                  <span className="font-semibold text-white">{data?.users.suspended}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${suspendedPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Logs Distibution */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Activity className="text-indigo-400" size={18} />
            System Event Metrics
          </h3>

          <div className="space-y-4">
            {data?.logsDistribution.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No event logs logged.
              </div>
            ) : (
              data?.logsDistribution.map((log, index) => {
                const maxCount = Math.max(...data.logsDistribution.map(l => l.count));
                const widthPct = Math.round((log.count / maxCount) * 100);
                return (
                  <div key={index} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span className="capitalize">{log.action.replace('USER_', '').replace('FILE_', '').replace('AI_', '').replace('_', ' ')}</span>
                      <span className="text-white">{log.count} hits</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brandPurple to-brandViolet rounded-full" style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
