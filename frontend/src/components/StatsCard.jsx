import React from 'react';

const StatsCard = ({ title, value, icon: Icon, description, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
    cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400',
    red: 'from-red-500/20 to-rose-500/10 border-red-500/20 text-red-400',
    violet: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/20 text-violet-400',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20 text-amber-400',
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <div className={`glass-panel bg-gradient-to-br ${selectedColor.split(' ').slice(0, 2).join(' ')} ${selectedColor.split(' ').slice(2, 3).join(' ')} p-6 rounded-2xl flex items-center justify-between border shadow-lg hover:translate-y-[-2px] transition-all duration-300`}>
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
      <div className={`p-4 rounded-xl bg-white/5 border ${selectedColor.split(' ').slice(2).join(' ')}`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatsCard;
