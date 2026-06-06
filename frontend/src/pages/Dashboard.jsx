import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import StatsCard from '../components/StatsCard.jsx';
import { MessageSquare, FileText, User, ArrowRight, CreditCard, Activity, Upload, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { getAuthHeaders, user } = useAuth();
  const [data, setData] = useState({
    stats: { totalChats: 0, totalFiles: 0, subscriptionPlan: 'Free', subscriptionActive: true },
    recentLogs: [],
    recentFiles: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/users/dashboard', {
        headers: getAuthHeaders()
      });
      const resData = await response.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatLogAction = (action) => {
    return action.replace('USER_', '').replace('FILE_', '').replace('AI_', '').replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl bg-gradient-to-r from-brandPurple/10 via-brandViolet/10 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Access your custom AI tools. Converse with standard models, review saved transcripts, upload documents for summarization, and query reports.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            to="/chat"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-brandPurple to-brandViolet hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] transition-all"
          >
            <MessageSquare size={16} />
            New AI Chat
          </Link>
          <Link
            to="/document-analysis"
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm flex items-center gap-2 active:scale-[0.98] transition-all"
          >
            <Upload size={16} />
            Upload File
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="AI Conversations"
          value={data.stats.totalChats}
          icon={MessageSquare}
          description="Total active chat instances"
          color="indigo"
        />
        <StatsCard
          title="Uploaded Files"
          value={data.stats.totalFiles}
          icon={FileText}
          description="Documents in dashboard storage"
          color="emerald"
        />
        <StatsCard
          title="Subscription Plan"
          value={data.stats.subscriptionPlan}
          icon={CreditCard}
          description={data.stats.subscriptionActive ? 'Subscription status: Active' : 'Suspended / Expired'}
          color="cyan"
        />
        <StatsCard
          title="Security Actions"
          value={data.recentLogs.length}
          icon={Activity}
          description="System events logged"
          color="violet"
        />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Uploads */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-indigo-400" size={20} />
              <h3 className="font-bold text-white text-lg">Stored Files</h3>
            </div>
            <Link to="/document-analysis" className="text-xs font-semibold text-brandPurple hover:text-indigo-400 transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3 pr-1">
            {data.recentFiles.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No documents uploaded yet. Go to Document Summarizer to upload your first PDF, DOCX or TXT file.
              </div>
            ) : (
              data.recentFiles.map((f) => (
                <div key={f.id} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between transition-all group">
                  <div className="overflow-hidden flex-1 mr-4">
                    <h5 className="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                      {f.originalName}
                    </h5>
                    <p className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span>{formatSize(f.size)}</span>
                      <span>•</span>
                      <span>{f.mimeType.split('/').pop().toUpperCase()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <Link 
                    to={`/document-analysis?fileId=${f.id}`}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-brandPurple/20 group-hover:text-indigo-300 group-hover:border-brandPurple/20 text-slate-400 hover:text-white transition-all shrink-0"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: User Activity Stream */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-indigo-400" size={20} />
              <h3 className="font-bold text-white text-lg">Activity Stream</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-4 pr-1">
            {data.recentLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No activity logged.
              </div>
            ) : (
              data.recentLogs.map((log) => (
                <div key={log._id} className="flex gap-3 items-start text-sm">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-200 capitalize">
                      {formatLogAction(log.action)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{log.details}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(log.createdAt).toLocaleTimeString()} - {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
