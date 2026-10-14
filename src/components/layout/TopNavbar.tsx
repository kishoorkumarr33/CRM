import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Palette,
  Check,
  Plus,
  LogOut,
  User,
  Shield,
  Briefcase,
  Users,
  UserCheck,
  CheckSquare,
  ChevronDown,
  ExternalLink,
  Zap,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';
import { useTheme, ThemePreset } from '../../context/ThemeContext';
import { ActivePage } from './Sidebar';
import { Badge } from '../common/Badge';

interface TopNavbarProps {
  onNavigate: (page: ActivePage) => void;
  onOpenQuickAdd: (type: 'customer' | 'lead' | 'deal' | 'task') => void;
  onSelectCustomerForDetail?: (customerId: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth?: (view: 'login' | 'register') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onNavigate,
  onOpenQuickAdd,
  onSelectCustomerForDetail,
  onOpenAuth,
}) => {
  const { user, userProfile, role, logout, loginWithGoogle } = useAuth();
  const { notifications, handleMarkNotificationRead, customers, leads, deals } = useCRM();
  const { currentPreset, presets, setPreset, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setShowQuickAddMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter global search results
  const matchingCustomers = searchQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingLeads = searchQuery.trim()
    ? leads.filter(
        (l) =>
          l.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.company.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingDeals = searchQuery.trim()
    ? deals.filter((d) => d.dealName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const totalResults = matchingCustomers.length + matchingLeads.length + matchingDeals.length;
  const activePresetObj = presets.find((p) => p.id === currentPreset) || presets[0];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] text-slate-100">
      {/* Global Search Bar */}
      <div ref={searchRef} className="relative w-72 sm:w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search customers, leads, deals..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:border-[var(--accent-color)] text-slate-100 placeholder-slate-500 transition outline-hidden"
          />
        </div>

        {/* Global Search Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute left-0 mt-2 w-full bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-subtle)] p-2 z-50 max-h-96 overflow-y-auto">
            {totalResults === 0 ? (
              <p className="p-3 text-xs text-slate-400 text-center">No matching records found.</p>
            ) : (
              <div className="space-y-3">
                {matchingCustomers.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Customers</span>
                    {matchingCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          if (onSelectCustomerForDetail) onSelectCustomerForDetail(c.id);
                          onNavigate('customer-detail');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-800/70 text-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-slate-200">{c.name}</span>
                          <span className="text-slate-400 font-normal">({c.company})</span>
                        </div>
                        <Badge size="sm" variant="primary">{c.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}

                {matchingLeads.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Leads</span>
                    {matchingLeads.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          onNavigate('leads');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-800/70 text-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-semibold text-slate-200">{l.leadName}</span>
                          <span className="text-slate-400 font-normal">({l.company})</span>
                        </div>
                        <Badge size="sm" variant="warning">{l.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}

                {matchingDeals.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Deals</span>
                    {matchingDeals.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onNavigate('deals');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-800/70 text-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold text-slate-200">{d.dealName}</span>
                          <span className="text-slate-400 font-normal">({d.customerName})</span>
                        </div>
                        <Badge size="sm" variant="success">{d.stage}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Quick Add, Zero-White Theme Presets, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 3D Quick Add Split Button & Dropdown */}
        <div ref={quickAddRef} className="relative">
          <div className="inline-flex rounded-xl shadow-xs">
            <button
              onClick={() => onOpenQuickAdd('customer')}
              className="btn-3d-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-r-none border-r-0 tracking-wide"
              title="Quick Add Overlay (Hotkey: Q or Cmd+K)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-extrabold">Quick Add</span>
              <span className="hidden md:inline-block px-1 py-0.2 rounded bg-indigo-900/60 text-[9px] font-mono border border-indigo-400/30 text-indigo-200">
                Q
              </span>
            </button>
            <button
              onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
              className="btn-3d-primary px-2 py-1.5 text-xs rounded-l-none border-l border-indigo-400/40"
              title="Select Quick Add Type"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {showQuickAddMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] py-1.5 z-50 overflow-hidden modal-3d">
              <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Quick Add
              </div>
              <button
                onClick={() => {
                  onOpenQuickAdd('customer');
                  setShowQuickAddMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-indigo-300 text-left transition"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>New Customer</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">Alt+1</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAdd('lead');
                  setShowQuickAddMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-amber-300 text-left transition"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>New Lead</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">Alt+2</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAdd('deal');
                  setShowQuickAddMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-emerald-300 text-left transition"
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>New Deal</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">Alt+3</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAdd('task');
                  setShowQuickAddMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-rose-300 text-left transition"
              >
                <CheckSquare className="w-4 h-4 text-rose-400" />
                <span>New Task</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">Alt+4</span>
              </button>
            </div>
          )}
        </div>

        {/* Suggested Zero-White Theme & Color Selector */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="btn-3d-secondary flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 transition"
            aria-label="Theme suggestions and color presets"
            title="Choose from suggested zero-white themes & colors"
          >
            <Palette className="w-4 h-4 text-[var(--accent-color)]" />
            <span className="hidden sm:inline font-bold text-[11px]">{activePresetObj.name}</span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-slate-700 shadow-xs"
              style={{ backgroundColor: activePresetObj.accentColor }}
            />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[var(--bg-surface)] rounded-2xl shadow-2xl border-2 border-[var(--border-subtle)] p-3 z-50 modal-3d">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Suggested Themes & Colors</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Zero white background • Premium dark palettes</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/40 rounded-md transition"
                  title="Cycle to next theme preset"
                >
                  Cycle Next
                </button>
              </div>

              <div className="space-y-1.5">
                {presets.map((preset) => {
                  const isSelected = preset.id === currentPreset;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setPreset(preset.id as ThemePreset);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition border ${
                        isSelected
                          ? 'bg-[var(--bg-elevated)] border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-slate-300'
                      }`}
                    >
                      {/* Swatch Previews */}
                      <div className="mt-0.5 flex flex-col items-center gap-1">
                        <div className="flex gap-1 p-1 rounded-md bg-black/60 border border-slate-800">
                          {preset.swatches.map((color, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-black/40"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {preset.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{preset.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-slate-400">
                <span>Active: <strong className="text-slate-200">{activePresetObj.name}</strong></span>
                <span className="font-mono text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  Zero-White Enforced
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dedicated Login / Sign Up Page Button */}
        {onOpenAuth && (
          <button
            onClick={() => onOpenAuth('login')}
            className="btn-3d-secondary hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            title="Open Login and Signup page"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login / Register</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition"
            aria-label="View notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden z-50 modal-3d">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <span className="text-xs font-bold text-slate-100">Notifications ({unreadCount})</span>
                <span
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  onClick={() => notifications.forEach((n) => handleMarkNotificationRead(n.id))}
                >
                  Mark all as read
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-center text-slate-400">No active notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkNotificationRead(notif.id)}
                      className={`p-3 text-xs transition cursor-pointer hover:bg-slate-800/60 ${
                        notif.read ? 'opacity-60' : 'bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/70 transition"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-400/40 shadow-xs">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-slate-200 block leading-tight truncate max-w-[110px]">
                {userProfile?.displayName || 'CRM User'}
              </span>
              <span className="text-[10px] capitalize text-amber-400 block font-medium">
                {role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] p-2 z-50 modal-3d">
              <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                <p className="text-xs font-bold text-slate-100 truncate">{userProfile?.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userProfile?.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge size="sm" variant={role === 'admin' ? 'purple' : role === 'manager' ? 'primary' : 'secondary'}>
                    <Shield className="w-3 h-3" />
                    {role.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{userProfile?.department}</span>
                </div>
              </div>

              {onOpenAuth && (
                <>
                  <button
                    onClick={() => {
                      onOpenAuth('login');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/80 rounded-lg transition"
                  >
                    <LogIn className="w-4 h-4 text-amber-400" />
                    Open Login Page
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('register');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/80 rounded-lg transition"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    Open Sign Up Page
                  </button>
                </>
              )}

              {!user && (
                <button
                  onClick={() => {
                    loginWithGoogle();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-950/40 rounded-lg transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Sign In with Google
                </button>
              )}

              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 rounded-lg transition"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Settings
              </button>

              {user && (
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    if (onOpenAuth) onOpenAuth('login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
