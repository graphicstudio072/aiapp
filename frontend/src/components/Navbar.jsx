import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, LogOut, User, Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel bg-[#0d0e15]/80 border-b border-white/5 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-100"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Antigravity AI
          </span>
          <span className="hidden md:inline px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-brandPurple/20 text-indigo-300 border border-brandPurple/30 rounded-full">
            v1.0.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-200"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brandPurple to-brandViolet flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-indigo-500/20">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay to close */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-2xl py-2 z-20 fade-in">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold truncate text-slate-200">{user?.email}</p>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-brandPurple/15 hover:text-indigo-300 transition-colors"
                >
                  <User size={16} />
                  My Profile
                </Link>
                
                <div className="border-t border-white/5 my-1"></div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
