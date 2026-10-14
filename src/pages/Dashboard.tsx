import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Briefcase,
  IndianRupee,
  TrendingUp,
  CheckSquare,
  AlertCircle,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  PhoneCall,
  Mail,
  Video,
  FileText,
  Zap,
  Layers,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { formatINR } from '../utils/formatCurrency';
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart';
import { LeadSourceChart } from '../components/charts/LeadSourceChart';
import { PipelineFunnelChart } from '../components/charts/PipelineFunnelChart';
import { EmployeePerformanceChart } from '../components/charts/EmployeePerformanceChart';
import { ActivePage } from '../components/layout/Sidebar';

interface DashboardProps {
  onNavigate: (page: ActivePage) => void;
  onOpenQuickAdd: (type: 'customer' | 'lead' | 'deal' | 'task') => void;
  onSelectCustomerForDetail?: (customerId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenQuickAdd,
  onSelectCustomerForDetail,
}) => {
  const {
    customers,
    leads,
    deals,
    tasks,
    interactions,
    employees,
    metrics,
    handleToggleTaskStatus,
    openQuickAdd,
    handleLoadSampleData,
  } = useCRM();
  const { userProfile, role } = useAuth();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'quarter' | 'year' | 'all'>('30d');

  const todayStr = new Date().toISOString().split('T')[0];

  const isEmpty = customers.length === 0 && leads.length === 0 && deals.length === 0;

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate < todayStr && t.status !== 'Completed' && t.status !== 'Cancelled')
      .slice(0, 4);
  }, [tasks, todayStr]);

  // Upcoming follow-up tasks
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate >= todayStr && t.status !== 'Completed' && t.status !== 'Cancelled')
      .slice(0, 5);
  }, [tasks, todayStr]);

  // Recent activity logs
  const recentInteractions = useMemo(() => {
    return interactions.slice(0, 5);
  }, [interactions]);

  const interactionIcons = {
    Call: PhoneCall,
    Meeting: Video,
    Email: Mail,
    Note: FileText,
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* 3D Hero Welcome Banner in Zero-White Theme with Rich Dark Gradient */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[var(--bg-card)] text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] border border-[var(--border-subtle)] overflow-hidden">
        {/* Subtle 3D reflective light effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {role.toUpperCase()} WORKSPACE
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero-White Theme • 3D Active
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white font-sans">
              Welcome back, {userProfile?.displayName || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
              {isEmpty
                ? 'Your CRM database is clean with zero dummy records. Press Quick Add (Q) to rapidly create records in ₹ INR.'
                : `Tracking ${metrics.totalCustomers} customer accounts, ${formatINR(metrics.totalWonRevenue)} in won revenue, and ${metrics.activeDeals} deals in pipeline.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={() => openQuickAdd('customer')}
              className="btn-3d-amber py-2.5 px-4 text-xs flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Quick Add Record</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono text-amber-200 border border-amber-400/30">
                Q
              </kbd>
            </button>
          </div>
        </div>

        {/* 3D background sphere glow */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* When CRM is clean/empty, show 3D Clean Slate Onboarding Card */}
      {isEmpty && (
        <div className="card-3d p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 transform hover:scale-110 transition-transform font-black">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight">Clean Slate Database Initialized</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Zero dummy records. You can create your own custom customers, leads, and deals in Indian Rupees (₹) using the Quick Add overlay, or click below to populate sample demo records for testing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => openQuickAdd('customer')}
              className="btn-3d-amber px-5 py-2.5 text-xs flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              Launch Quick Add Overlay (Q)
            </button>
            <button
              onClick={handleLoadSampleData}
              className="btn-3d-secondary px-4 py-2.5 text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Load Sample Demo Records
            </button>
          </div>
        </div>
      )}

      {/* 3D KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers}
          icon={Users}
          change={metrics.totalCustomers > 0 ? '+100%' : undefined}
          isPositive={true}
          subtext="Active client accounts"
          colorScheme="indigo"
          onClick={() => onNavigate('customers')}
        />
        <StatCard
          title="Total Won Revenue"
          value={formatINR(metrics.totalWonRevenue)}
          icon={IndianRupee}
          change={`${metrics.wonDeals} Deals Won`}
          isPositive={true}
          subtext="Realized business volume"
          colorScheme="emerald"
          onClick={() => onNavigate('deals')}
        />
        <StatCard
          title="Pipeline Volume"
          value={formatINR(metrics.pipelineValue)}
          icon={Briefcase}
          change={`${metrics.activeDeals} Active Deals`}
          isPositive={true}
          subtext="Unweighted forecast"
          colorScheme="amber"
          onClick={() => onNavigate('deals')}
        />
        <StatCard
          title="Lead Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          change={`${metrics.newLeads} Fresh Leads`}
          isPositive={metrics.conversionRate >= 20}
          subtext="Qualification efficiency"
          colorScheme="purple"
          onClick={() => onNavigate('leads')}
        />
      </div>

      {/* Sub-KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('tasks')}
          className="card-3d card-3d-hover p-4 flex items-center justify-between cursor-pointer bg-[var(--bg-card)] border border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40 shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
              <span className="text-xl font-black text-slate-100">{metrics.pendingTasks}</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('tasks')}
          className={`card-3d card-3d-hover p-4 flex items-center justify-between cursor-pointer bg-[var(--bg-card)] border border-[var(--border-subtle)] ${
            metrics.overdueFollowUps > 0 ? 'border-rose-500/60 bg-rose-950/20' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${metrics.overdueFollowUps > 0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-400 border border-slate-800'} shadow-xs`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Overdue Follow-ups</span>
              <span className="text-xl font-black text-slate-100">
                {metrics.overdueFollowUps}{' '}
                {metrics.overdueFollowUps > 0 && <span className="text-xs text-rose-400 font-bold">(Attention)</span>}
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('leads')}
          className="card-3d card-3d-hover p-4 flex items-center justify-between cursor-pointer bg-[var(--bg-card)] border border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Inbound Leads</span>
              <span className="text-xl font-black text-slate-100">{metrics.newLeads}</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Main 3D Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-100">Monthly Sales Revenue</h3>
              <p className="text-xs text-slate-400 font-medium">Won deal value vs active pipeline volume in ₹ INR</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs" />
                <span className="text-slate-300 font-semibold text-[11px]">Closed Won</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs" />
                <span className="text-slate-300 font-semibold text-[11px]">Active Pipeline</span>
              </div>
            </div>
          </div>
          <MonthlySalesChart deals={deals} />
        </div>

        <div className="card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-100">Lead Sources</h3>
              <p className="text-xs text-slate-400 font-medium">Acquisition channel breakdown</p>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              View Pipeline
            </button>
          </div>
          <LeadSourceChart leads={leads} />
        </div>
      </div>

      {/* Secondary 3D Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-100">Pipeline Funnel Distribution</h3>
              <p className="text-xs text-slate-400 font-medium">Volume across stages in ₹ INR</p>
            </div>
            <button
              onClick={() => onNavigate('deals')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Open Deals
            </button>
          </div>
          <PipelineFunnelChart deals={deals} />
        </div>

        <div className="card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-100">Team Attainment</h3>
              <p className="text-xs text-slate-400 font-medium">Closed sales and active quotas</p>
            </div>
            <button
              onClick={() => onNavigate('employees')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Directory
            </button>
          </div>
          <EmployeePerformanceChart employees={employees} deals={deals} tasks={tasks} />
        </div>
      </div>

      {/* Operational Follow-ups & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Upcoming Follow-ups &amp; Action Items
              </h3>
              <p className="text-xs text-slate-400 font-medium">Tasks scheduled for team resolution</p>
            </div>
            <button
              onClick={() => openQuickAdd('task')}
              className="btn-3d-secondary px-3 py-1 text-xs"
            >
              + Add Task
            </button>
          </div>

          <div className="space-y-2.5">
            {overdueTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-rose-950/40 border border-rose-900 shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-rose-300 uppercase px-1.5 py-0.2 rounded bg-rose-900/80">OVERDUE</span>
                    <h4 className="text-xs font-bold text-slate-100 truncate">{t.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.relatedName} • Assigned: {t.assignedEmployeeName}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleTaskStatus(t.id, 'Completed')}
                  className="btn-3d-secondary px-2.5 py-1 text-[11px] text-rose-300 font-bold shrink-0"
                >
                  Mark Done
                </button>
              </div>
            ))}

            {upcomingTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{t.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span>Due: {t.dueDate}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-300">{t.assignedEmployeeName}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleTaskStatus(t.id, 'Completed')}
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 transition"
                  title="Complete task"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-xs text-center text-slate-400 py-8 font-medium">
                No active follow-ups. Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-amber-300 rounded font-mono">Q</kbd> to schedule one.
              </p>
            )}
          </div>
        </div>

        {/* Recent Communication */}
        <div className="card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Customer Communications
              </h3>
              <p className="text-xs text-slate-400 font-medium">Recent client touchpoints</p>
            </div>
            <button
              onClick={() => onNavigate('interactions')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Full Log
            </button>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {recentInteractions.map((item) => {
              const Icon = interactionIcons[item.type] || FileText;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectCustomerForDetail) onSelectCustomerForDetail(item.customerId);
                    onNavigate('customer-detail');
                  }}
                  className="py-3 flex items-start gap-3 cursor-pointer group hover:bg-slate-800/60 rounded-xl px-2 transition"
                >
                  <div className="p-2 rounded-xl bg-[var(--bg-app)] text-amber-400 group-hover:bg-amber-950/40 shadow-2xs transition shrink-0 mt-0.5 border border-[var(--border-subtle)]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 truncate">
                        {item.customerName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 truncate font-medium">{item.summary}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Logged by {item.employeeName}</p>
                  </div>
                </div>
              );
            })}

            {interactions.length === 0 && (
              <p className="text-xs text-center text-slate-400 py-8 font-medium">
                No customer interactions logged yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
