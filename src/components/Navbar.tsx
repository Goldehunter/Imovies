import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Film, User, Bell, Shield, LogOut, Ticket } from 'lucide-react';
import { NotificationItem } from '../types/cinema';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
}

export function Navbar({
  currentTab,
  onSelectTab,
  notifications,
  onOpenNotifications,
  onOpenAuthModal,
}: NavbarProps) {
  const { user, isAuthenticated, isAdmin, logout, switchRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0b0d14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-18">
        {/* Zone 1: Brand title, one line, single text element */}
        <button
          onClick={() => onSelectTab('movies')}
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-rose-950/40">
            <Film className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-display text-2xl tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-white bg-clip-text text-transparent">
            IMovies
          </span>
        </button>

        {/* Zone 2: 4–5 single-line clean nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('movies')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentTab === 'movies'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onSelectTab('cinemas')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentTab === 'cinemas'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cinemas
          </button>
          <button
            onClick={() => onSelectTab('bookings')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'bookings'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Bookings</span>
          </button>
          <button
            onClick={() => onSelectTab('experience')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentTab === 'experience'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Formats
          </button>
          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'text-rose-400 border-rose-400 font-semibold'
                  : 'border-transparent text-rose-300/80 hover:text-rose-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action & controls cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Button */}
          {isAuthenticated && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
          )}

          {/* User profile / Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-all focus:outline-none"
              >
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[110px] truncate">
                  {user.name}
                </span>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-500/50"
                />
              </button>

              {/* Profile dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-slate-100 text-sm truncate">{user.name}</p>
                    <p className="text-slate-400 truncate mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Current Role</span>
                      <span className={`font-semibold uppercase tracking-wider ${isAdmin ? 'text-rose-400' : 'text-amber-400'}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Switch Role Quick Toggle */}
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Switch Active Role:</p>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg">
                      <button
                        onClick={() => {
                          switchRole('user');
                          setProfileDropdownOpen(false);
                          if (currentTab === 'admin') onSelectTab('movies');
                        }}
                        className={`py-1 text-center font-medium rounded transition-colors ${
                          !isAdmin ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        User (Alex)
                      </button>
                      <button
                        onClick={() => {
                          switchRole('admin');
                          setProfileDropdownOpen(false);
                          onSelectTab('admin');
                        }}
                        className={`py-1 text-center font-medium rounded transition-colors ${
                          isAdmin ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('bookings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2"
                  >
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Cinema Bookings</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onSelectTab('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-rose-400 hover:bg-slate-800/80 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
