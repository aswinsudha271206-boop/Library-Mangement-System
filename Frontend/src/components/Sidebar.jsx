// src/components/Sidebar.jsx
import React from 'react';
import { LayoutDashboard, BookOpen, Users, RefreshCw, BarChart3, LogOut, UserPlus } from 'lucide-react';

export default function Sidebar({ currentView, setView, onLogout }) {
  // Registered application layout states including the new student configuration engine
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Manage Books', icon: BookOpen },
    { id: 'members', label: 'Manage Members', icon: Users },
    { id: 'issueRegistry', label: 'Issue Registry', icon: RefreshCw },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col justify-between p-6 min-h-screen border-r border-slate-900 shrink-0 sticky top-0 h-screen">
      <div>
        {/* Brand Title Display Header */}
        <div className="flex items-center gap-3 mb-10 px-2 py-1">
          <div className="flex gap-1 items-end">
            <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
            <span className="w-1 h-4 bg-cyan-400 rounded-full"></span>
            <span className="w-1 h-5 bg-indigo-400 rounded-full"></span>
          </div>
          <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Alexandria
          </h1>
        </div>
        
        {/* Navigation Options List */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border-l-4 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-cyan-400 font-semibold'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Persistent Logout Action Button */}
      <button
        onClick={onLogout}
        className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 rounded-xl transition-colors duration-200 cursor-pointer"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
}