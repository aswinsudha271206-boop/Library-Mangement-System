import React from 'react';

export default function StatsCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}