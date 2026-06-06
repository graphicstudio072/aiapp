import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Sliders, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const AdminSettings = () => {
  const { getAuthHeaders } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key, value, description) => {
    setSuccessMsg('');
    setErrorMsg('');
    setSaveLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value, description })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`Setting '${key}' updated successfully.`);
        fetchSettings();
      } else {
        setErrorMsg(data.error || 'Failed to update setting.');
      }
    } catch (err) {
      setErrorMsg('Connection error.');
    } finally {
      setSaveLoading(false);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sliders className="text-indigo-400" size={24} />
          Application Configurations
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">Customize global model tokens, system limits, and default directives</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {settings.map((setting) => (
          <SettingField 
            key={setting._id} 
            setting={setting} 
            onSave={handleUpdateSetting}
            disabled={saveLoading}
          />
        ))}
      </div>
    </div>
  );
};

// Sub-component for individual settings to have independent local state
const SettingField = ({ setting, onSave, disabled }) => {
  const [val, setVal] = useState(setting.value);

  const formatKeyName = (key) => {
    return key.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
      <div>
        <h3 className="font-bold text-white text-sm">{formatKeyName(setting.key)}</h3>
        <p className="text-slate-400 text-xs mt-0.5">{setting.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {setting.key === 'system_instructions' ? (
          <textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            disabled={disabled}
            rows="3"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none resize-none font-mono"
          />
        ) : typeof setting.value === 'number' ? (
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            disabled={disabled}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none font-mono"
          />
        ) : (
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            disabled={disabled}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none font-mono"
          />
        )}

        <button
          onClick={() => onSave(setting.key, val, setting.description)}
          disabled={disabled || val === setting.value}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-30 disabled:pointer-events-none"
        >
          <Save size={14} />
          Save Key
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
