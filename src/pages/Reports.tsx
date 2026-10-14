import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  IndianRupee,
  TrendingUp,
  UserCheck,
  CheckSquare,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Badge } from '../components/common/Badge';
import { exportToCSV } from '../utils/csv';
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart';
import { LeadSourceChart } from '../components/charts/LeadSourceChart';
import { PipelineFunnelChart } from '../components/charts/PipelineFunnelChart';
import { EmployeePerformanceChart } from '../components/charts/EmployeePerformanceChart';
import { formatINR } from '../utils/formatCurrency';

export const Reports: React.FC = () => {
  const { customers, leads, deals, tasks, employees } = useCRM();

  const [reportType, setReportType] = useState<'sales' | 'leads' | 'employees' | 'tasks'>('sales');
  const [datePeriod, setDatePeriod] = useState<'current_month' | 'q2' | 'year' | 'all'>('year');

  const wonDeals = useMemo(() => deals.filter((d) => d.stage === 'Won'), [deals]);
  const lostDeals = useMemo(() => deals.filter((d) => d.stage === 'Lost'), [deals]);
  const totalWonRevenue = useMemo(() => wonDeals.reduce((sum, d) => sum + (d.value || 0), 0), [wonDeals]);
  const totalLostRevenue = useMemo(() => lostDeals.reduce((sum, d) => sum + (d.value || 0), 0), [lostDeals]);

  // Export handlers for each report
  const exportSalesReport = () => {
    exportToCSV('crm_sales_revenue_report', deals, [
      { key: 'id', label: 'Deal ID' },
      { key: 'dealName', label: 'Opportunity Name' },
      { key: 'customerName', label: 'Customer' },
      { key: 'value', label: 'Value (₹)' },
      { key: 'stage', label: 'Stage' },
      { key: 'probability', label: 'Probability (%)' },
      { key: 'assignedEmployeeName', label: 'Sales Rep' },
      { key: 'expectedClosingDate', label: 'Expected Close' },
      { key: 'actualClosingDate', label: 'Actual Close' },
    ]);
  };

  const exportLeadsReport = () => {
    exportToCSV('crm_lead_conversion_report', leads, [
      { key: 'id', label: 'Lead ID' },
      { key: 'leadName', label: 'Lead Name' },
      { key: 'company', label: 'Company' },
      { key: 'source', label: 'Acquisition Source' },
      { key: 'estimatedValue', label: 'Est. Value' },
      { key: 'status', label: 'Pipeline Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'assignedEmployeeName', label: 'Assigned Staff' },
      { key: 'convertedCustomerId', label: 'Converted Customer ID' },
    ]);
  };

  const exportEmployeeReport = () => {
    const data = employees.map((emp) => {
      const repWon = deals
        .filter((d) => (d.assignedEmployeeId === emp.id || d.assignedEmployeeName === emp.name) && d.stage === 'Won')
        .reduce((sum, d) => sum + (d.value || 0), 0);
      const repDealsCount = deals.filter(
        (d) => d.assignedEmployeeId === emp.id || d.assignedEmployeeName === emp.name
      ).length;
      const repTasksDone = tasks.filter(
        (t) => (t.assignedEmployeeId === emp.id || t.assignedEmployeeName === emp.name) && t.status === 'Completed'
      ).length;

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        jobTitle: emp.jobTitle,
        wonRevenue: repWon,
        totalDeals: repDealsCount,
        tasksCompleted: repTasksDone,
      };
    });

    exportToCSV('crm_employee_performance_report', data, [
      { key: 'id', label: 'Employee ID' },
      { key: 'name', label: 'Staff Name' },
      { key: 'department', label: 'Department' },
      { key: 'jobTitle', label: 'Job Title' },
      { key: 'wonRevenue', label: 'Won Revenue (₹)' },
      { key: 'totalDeals', label: 'Total Managed Deals' },
      { key: 'tasksCompleted', label: 'Tasks Completed' },
    ]);
  };

  const exportTasksReport = () => {
    exportToCSV('crm_task_sla_audit_report', tasks, [
      { key: 'id', label: 'Task ID' },
      { key: 'title', label: 'Task Title' },
      { key: 'relatedName', label: 'Related Entity' },
      { key: 'assignedEmployeeName', label: 'Assigned Staff' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'completionDate', label: 'Completion Date' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Analytics &amp; Reports
            </h1>
            <Badge variant="primary" size="md">
              Data Grounded
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time business intelligence calculated directly from live database transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (reportType === 'sales') exportSalesReport();
              else if (reportType === 'leads') exportLeadsReport();
              else if (reportType === 'employees') exportEmployeeReport();
              else exportTasksReport();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/30 transition"
          >
            <Download className="w-4 h-4" />
            Export Selected Report (CSV)
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'sales', label: 'Sales & Revenue Analysis' },
            { id: 'leads', label: 'Lead Source & Conversion' },
            { id: 'employees', label: 'Employee Quota & Attainment' },
            { id: 'tasks', label: 'Task Execution & SLA Audit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                reportType === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={datePeriod}
            onChange={(e) => setDatePeriod(e.target.value as any)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300"
          >
            <option value="current_month">Current Month</option>
            <option value="q2">Q2 2024</option>
            <option value="year">Fiscal Year 2024</option>
            <option value="all">Lifetime History</option>
          </select>
        </div>
      </div>

      {/* REPORT 1: SALES & REVENUE */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Closed Won
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatINR(totalWonRevenue)}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">{wonDeals.length} won contracts</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Closed Lost Volume
              </span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                {formatINR(totalLostRevenue)}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">{lostDeals.length} lost opportunities</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Win-to-Loss Revenue Ratio
              </span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {totalLostRevenue > 0 ? (totalWonRevenue / totalLostRevenue).toFixed(1) : totalWonRevenue > 0 ? '100' : '0'}:1
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Capital efficiency</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Monthly Won Revenue Trajectory</h3>
              <MonthlySalesChart deals={deals} />
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Stage Volume Distribution</h3>
              <PipelineFunnelChart deals={deals} />
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: LEADS & CONVERSION */}
      {reportType === 'leads' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{leads.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Qualified &amp; Converted
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {leads.filter((l) => l.status === 'Converted').length}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Conversion Rate</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {leads.length > 0
                  ? Math.round((leads.filter((l) => l.status === 'Converted').length / leads.length) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Source Channels Breakdown</h3>
              <LeadSourceChart leads={leads} />
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Channel Conversion Efficacy</h3>
              <div className="space-y-3">
                {Array.from(new Set(leads.map((l) => l.source))).map((source) => {
                  const sLeads = leads.filter((l) => l.source === source);
                  const converted = sLeads.filter((l) => l.status === 'Converted').length;
                  const pct = Math.round((converted / sLeads.length) * 100);

                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{source}</span>
                        <span className="text-slate-500 font-mono">
                          {converted} / {sLeads.length} converted ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: EMPLOYEE ATTAINMENT */}
      {reportType === 'employees' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Representative Quota Attainment</h3>
            <EmployeePerformanceChart employees={employees} deals={deals} tasks={tasks} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Won Revenue (₹)</th>
                  <th className="py-3 px-4">Active Pipeline (₹)</th>
                  <th className="py-3 px-4">Tasks Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => {
                  const won = deals
                    .filter((d) => (d.assignedEmployeeId === emp.id || d.assignedEmployeeName === emp.name) && d.stage === 'Won')
                    .reduce((sum, d) => sum + (d.value || 0), 0);
                  const pipe = deals
                    .filter((d) => (d.assignedEmployeeId === emp.id || d.assignedEmployeeName === emp.name) && d.stage !== 'Won' && d.stage !== 'Lost')
                    .reduce((sum, d) => sum + (d.value || 0), 0);
                  const done = tasks.filter(
                    (t) => (t.assignedEmployeeId === emp.id || t.assignedEmployeeName === emp.name) && t.status === 'Completed'
                  ).length;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {emp.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{emp.jobTitle}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-600">{formatINR(won)}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600">{formatINR(pipe)}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{done} Completed</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: TASK SLA AUDIT */}
      {reportType === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{tasks.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Completed Deliverables
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {tasks.filter((t) => t.status === 'Completed').length}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                SLA Breaches / Overdue
              </span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                {tasks.filter((t) => t.dueDate < new Date().toISOString().split('T')[0] && t.status !== 'Completed').length}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {t.title}
                      <span className="block text-[10px] text-slate-400 font-normal">{t.relatedName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{t.assignedEmployeeName}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">{t.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={t.status === 'Completed' ? 'success' : 'warning'} size="sm">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{t.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
