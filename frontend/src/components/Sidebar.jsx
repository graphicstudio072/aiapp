import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  User, 
  Users, 
  Database, 
  CreditCard, 
  Terminal, 
  Sliders,
  Settings,
  Bot,
  ShieldAlert,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Assistant', path: '/chat', icon: MessageSquare },
    { name: 'Document Summarizer', path: '/document-analysis', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Admin Hub', path: '/admin', icon: ShieldAlert },
    { name: 'User Directory', path: '/admin/users', icon: Users },
    { name: 'Database Monitor', path: '/admin/database', icon: Database },
    { name: 'Activity Audit', path: '/admin/logs', icon: Terminal },
    { name: 'Plan Settings', path: '/admin/subscriptions', icon: CreditCard },
    { name: 'App Settings', path: '/admin/settings', icon: Sliders },
  ];

  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0e15] border-r border-white/5 p-6 
    flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-76px)]
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={sidebarClass}>
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <span className="font-bold text-slate-200">Menu</span>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User Badge Info */}
        <div className="mb-8 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Bot size={20} className="animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-slate-200">{user?.name}</h4>
            <p className="text-xs text-slate-400 capitalize">{user?.role} Account</p>
          </div>
        </div>

        {/* Primary Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 block mb-2">Main Services</span>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-brandPurple to-brandViolet text-white shadow-lg shadow-indigo-500/15' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }
                `}
              >
                <Icon size={18} />
                {link.name}
              </NavLink>
            );
          })}

          {/* Admin Section */}
          {isAdmin && (
            <div className="pt-6 space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-red-400/80 uppercase px-3 block mb-2">Admin Panel</span>
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    end={link.path === '/admin'}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/25 shadow-md shadow-red-500/5' 
                        : 'text-slate-400 hover:text-red-400 hover:bg-red-500/5'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {link.name}
                  </NavLink>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer Settings Link */}
        <div className="pt-6 border-t border-white/5 mt-auto">
          <p className="text-[10px] text-slate-500 text-center">Powered by Google DeepMind Team</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
