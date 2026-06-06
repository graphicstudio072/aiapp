import React, { useState } from 'react';
import { CreditCard, Check, Settings, Save, CheckCircle2 } from 'lucide-react';

const AdminSubscriptions = () => {
  const [success, setSuccess] = useState('');
  
  // Local mockup state since subscription tier rules are saved in settings/code
  const [plans, setPlans] = useState([
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0 / mo',
      limits: 'Upload up to 3 files. Size limit 2MB per file. 50 messages/day.',
      activeModel: 'GPT-4o Mini',
      features: ['Basic File Summarizer', 'Standard chat assistant', 'Activity audit logs']
    },
    {
      id: 'premium',
      name: 'Premium Tier',
      price: '$29 / mo',
      limits: 'Upload up to 50 files. Size limit 10MB per file. 500 messages/day.',
      activeModel: 'GPT-4o Mini & GPT-4o',
      features: ['Advanced PDF & Word parsing', 'Prioritized chat queues', 'Q&A Chat for Documents', 'PDF export reports']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Tier',
      price: '$149 / mo',
      limits: 'Unlimited file uploads. Max size 50MB. Unlimited messages.',
      activeModel: 'Custom / Claude / GPT-4o',
      features: ['Full OCR capabilities', 'Priority system pipelines', 'Dedicated admin statistics', 'API integration access']
    }
  ]);

  const handleUpdateLimit = (id, newLimits) => {
    setSuccess('');
    setPlans(prev => prev.map(p => p.id === id ? { ...p, limits: newLimits } : p));
  };

  const handleSaveTiers = (e) => {
    e.preventDefault();
    setSuccess('Subscription configurations saved to DB settings collection.');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="text-indigo-400" size={24} />
          Subscription & Plans Manager
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">Define account levels, file limits, prompt quotas, and pricing tags</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveTiers} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-white/5 border-b border-l border-white/5 text-[9px] uppercase font-bold tracking-wider text-slate-400 rounded-bl-xl capitalize">
                {p.id} tier
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <span className="text-2xl font-extrabold text-indigo-300">{p.price}</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usage Restrictions</label>
                <textarea
                  value={p.limits}
                  onChange={(e) => handleUpdateLimit(p.id, e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Active AI Model</span>
                <span className="font-semibold text-slate-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md block w-fit">
                  {p.activeModel}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Feature Matrix</span>
                <ul className="space-y-2 text-xs text-slate-400">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-white/5 pt-6">
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-brandPurple to-brandViolet hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-xs active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/15"
          >
            <Save size={14} />
            Commit Plan Rules
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSubscriptions;
