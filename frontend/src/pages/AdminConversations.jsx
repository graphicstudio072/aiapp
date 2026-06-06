import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { MessageSquare, Trash2, Search, Calendar, User, Mail } from 'lucide-react';

const AdminConversations = () => {
  const { getAuthHeaders } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/admin/conversations', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleDeleteConvo = async (id) => {
    if (!confirm('Are you sure you want to delete this user conversation? This will clear all its message history.')) return;

    try {
      const response = await fetch(`/api/admin/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setConversations(conversations.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const titleMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const userMatch = c.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      c.user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || userMatch;
  });

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
            <MessageSquare className="text-indigo-400" size={24} />
            AI Chat Overseer
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Monitor, search, and audit AI dialogues across all user accounts</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by title or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all"
          />
        </div>
      </div>

      {/* Conversations Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Chat Title</th>
                <th className="p-4">Participant Name</th>
                <th className="p-4">Participant Email</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No active conversations found.
                  </td>
                </tr>
              ) : (
                filteredConversations.map((c) => (
                  <tr key={c._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-2">
                      <MessageSquare size={14} className="text-slate-500" />
                      {c.title}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-500" />
                        {c.user?.name || <span className="text-slate-600 italic">Deleted User</span>}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {c.user ? (
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-500" />
                          {c.user.email}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        {new Date(c.updatedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteConvo(c._id)}
                        className="p-2 rounded bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Conversation history"
                      >
                        <Trash2 size={13} />
                      </button>
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

export default AdminConversations;
