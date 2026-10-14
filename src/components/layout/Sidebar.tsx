import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  UserPlus,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export type ActivePage =
  | 'dashboard'
  | 'customers'
  | 'customer-detail'
  | 'leads'
  | 'deals'
  | 'employees'
  | 'tasks'
  | 'interactions'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAuth?: (view: 'login' | 'register') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onOpenAuth,
}) => {
  const { customers, leads, deals, tasks } = useCRM();
  const { role, userProfile, switchDemoRole } = useAuth();

  const pendingTasksCount = tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length;
  const activeLeadsCount = leads.filter((l) => l.status === 'New' || l.status === 'Qualified').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
    { id: 'leads', label: 'Leads', icon: UserCheck, badge: activeLeadsCount > 0 ? activeLeadsCount : undefined, badgeVariant: 'warning' as const },
    { id: 'deals', label: 'Sales & Deals', icon: Briefcase, badge: deals.length },
    { id: 'employees', label: 'Employees', icon: UserPlus },
    { id: 'tasks', label: 'Tasks & Follow-ups', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeVariant: 'danger' as const },
    { id: 'interactions', label: 'Interactions', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white font-black text-lg shadow-md shadow-indigo-500/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Apex<span className="text-indigo-600">CRM</span>
                </span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise Pipeline</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-black text-xl shadow-md">
            A
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'customers' && activePage === 'customer-detail');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ActivePage)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate text-left">
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeVariant === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : item.badgeVariant === 'danger'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Direct Login / Sign Up Page Trigger */}
      {onOpenAuth && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onOpenAuth('login')}
            className={`w-full btn-3d-secondary py-2 px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2.5 transition ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Open Login & Signup Screen"
          >
            <LogIn className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            {!isCollapsed && <span>Login / Sign Up</span>}
          </button>
        </div>
      )}

      {/* Role Tester / Quick Role Switcher for Academic & Demo Presentations */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Role Simulator
            </span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
              {role}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 leading-tight">
            Switch permissions to test RBAC restrictions:
          </p>
          <div className="grid grid-cols-3 gap-1">
            {(['admin', 'manager', 'employee'] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchDemoRole(r)}
                className={`py-1 text-[10px] font-bold rounded capitalize transition ${
                  role === r
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-[var(--bg-elevated)] text-slate-300 hover:bg-slate-800 border border-[var(--border-subtle)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapse Toggle Footer */}
      {isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
