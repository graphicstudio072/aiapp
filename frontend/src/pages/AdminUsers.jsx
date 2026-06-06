import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, Plus, Trash2, Edit2, ShieldAlert, CheckCircle, UserPlus, X, AlertCircle } from 'lucide-react';

const AdminUsers = () => {
  const { getAuthHeaders, user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Add User State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('User');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free');

  // Edit User State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoleName, setEditRoleName] = useState('User');
  const [editSubscriptionPlan, setEditSubscriptionPlan] = useState('Free');

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, email, password, roleName, subscriptionPlan })
      });
      const data = await response.json();
      if (data.success) {
        setName('');
        setEmail('');
        setPassword('');
        setShowAddForm(false);
        fetchUsers();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.status === 'active' ? 'suspended' : 'active';
    try {
      const response = await fetch(`/api/admin/users/${userObj._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  const handleStartEdit = (userObj) => {
    setEditingUser(userObj);
    setEditName(userObj.name);
    setEditEmail(userObj.email);
    setEditRoleName(userObj.role.name);
    setEditSubscriptionPlan(userObj.subscription.plan);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          roleName: editRoleName,
          subscriptionPlan: editSubscriptionPlan
        })
      });
      const data = await response.json();
      if (data.success) {
        setEditingUser(null);
        fetchUsers();
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === loggedInUser.id) {
      alert('You cannot delete your own admin account.');
      return;
    }
    if (!confirm('Are you sure you want to permanently delete this user, including all their files and chat logs? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-indigo-400" size={24} />
            User Directory
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage details, tiers, roles, and status for accounts</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingUser(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brandPurple to-brandViolet hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          {showAddForm ? <X size={14} /> : <UserPlus size={14} />}
          {showAddForm ? 'Cancel Form' : 'Register New User'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs animate-pulse">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Register User Form */}
      {showAddForm && (
        <form onSubmit={handleAddUser} className="glass-panel p-6 rounded-3xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in">
          <h3 className="font-bold text-white text-sm col-span-3 pb-2 border-b border-white/5">Register User Profile</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
            <input
              type="text"
              required
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Security Role</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Subscription Plan</label>
            <select
              value={subscriptionPlan}
              onChange={(e) => setSubscriptionPlan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            >
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex items-end col-span-3 sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-brandPurple hover:bg-indigo-600 text-white font-semibold text-xs active:scale-[0.98] transition-all"
            >
              Create Account
            </button>
          </div>
        </form>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <form onSubmit={handleUpdateUser} className="glass-panel p-6 rounded-3xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-yellow-500/20 fade-in">
          <div className="flex justify-between items-center col-span-3 pb-2 border-b border-white/5">
            <h3 className="font-bold text-yellow-400 text-sm">Edit User: {editingUser.email}</h3>
            <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Security Role</label>
            <select
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Subscription Plan</label>
            <select
              value={editSubscriptionPlan}
              onChange={(e) => setEditSubscriptionPlan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none"
            >
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex items-end col-span-3 sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs active:scale-[0.98] transition-all"
            >
              Save Account Updates
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Subscription</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-white">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold
                      ${u.role.name === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}
                    `}>
                      {u.role.name}
                    </span>
                  </td>
                  <td className="p-4 capitalize">{u.subscription.plan}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold
                      ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/25'}
                    `}>
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-1 justify-center">
                    <button
                      onClick={() => handleStartEdit(u)}
                      className="p-2 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit User Info"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`p-2 rounded transition-colors
                        ${u.status === 'active'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }
                      `}
                      title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                    >
                      {u.status === 'active' ? <ShieldAlert size={13} /> : <CheckCircle size={13} />}
                    </button>
                    <button
                      disabled={u._id === loggedInUser.id}
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-2 rounded bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Permanently Delete Account"
                    >
                      <Trash2 size={13} />
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
};

export default AdminUsers;
