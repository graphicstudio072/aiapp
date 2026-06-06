import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Lock, Key, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, getAuthHeaders, updateProfileInState } = useAuth();
  
  // Profile form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, email })
      });
      const data = await response.json();
      if (data.success) {
        updateProfileInState(data.user);
        setProfileSuccess('Profile updated successfully.');
      } else {
        setProfileError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError('Server connection failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (data.success) {
        setPassSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setPassError('Server connection failed.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400 text-xs mt-0.5">Manage your profile details and security options</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Account Details Info */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col space-y-6 h-fit border border-white/5">
          <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brandPurple to-brandViolet flex items-center justify-center font-bold text-white text-3xl shadow-lg ring-4 ring-indigo-500/10">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{user?.name}</h3>
              <p className="text-slate-400 text-xs mt-0.5 truncate">{user?.email}</p>
            </div>
            <span className="px-3 py-1 bg-brandPurple/20 border border-brandPurple/30 text-indigo-300 text-xs font-semibold rounded-full capitalize">
              {user?.role} Role
            </span>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subscription Status</h4>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Plan Tier:</span>
                <span className="font-bold text-indigo-300 capitalize">{user?.subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="glass-panel p-6 rounded-3xl space-y-6 border border-white/5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <User className="text-indigo-400" size={18} />
              Profile Details
            </h3>

            {profileSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all text-xs"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-fit px-5 py-2.5 rounded-xl bg-brandPurple hover:bg-indigo-600 text-white font-semibold text-xs active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="glass-panel p-6 rounded-3xl space-y-6 border border-white/5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Lock className="text-indigo-400" size={18} />
              Change Password
            </h3>

            {passSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{passSuccess}</span>
              </div>
            )}
            {passError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Shield size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Shield size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="px-5 py-2.5 rounded-xl bg-brandPurple hover:bg-indigo-600 text-white font-semibold text-xs active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
