import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  ArrowRight,
  CheckCircle2,
  Calendar,
  IndianRupee,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Flame,
  ArrowUpDown,
  Download,
  Zap,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Lead, LeadStatus, PriorityLevel } from '../types/crm';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { LeadFormModal } from '../components/forms/LeadFormModal';
import { formatINR, formatINRCompact } from '../utils/formatCurrency';
import { ConvertLeadModal } from '../components/forms/ConvertLeadModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCSV } from '../utils/csv';
import { EmptyState } from '../components/common/EmptyState';

export const Leads: React.FC = () => {
  const { leads, employees, handleDeleteLead, handleUpdateLead, openQuickAdd } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Pagination for list view
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.leadName.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.interest.toLowerCase().includes(search.toLowerCase());

      const matchPriority = priorityFilter === 'all' || l.priority === priorityFilter;
      const matchSource = sourceFilter === 'all' || l.source === sourceFilter;
      const matchAssigned = assignedFilter === 'all' || l.assignedEmployeeId === assignedFilter;

      return matchSearch && matchPriority && matchSource && matchAssigned;
    });
  }, [leads, search, priorityFilter, sourceFilter, assignedFilter]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = leads.length;
    const convertedCount = leads.filter((l) => l.status === 'Converted').length;
    const rate = totalCount > 0 ? Math.round((convertedCount / totalCount) * 100) : 0;
    const pipelineValue = leads
      .filter((l) => l.status !== 'Converted' && l.status !== 'Lost')
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    return { totalCount, convertedCount, rate, pipelineValue };
  }, [leads]);

  const handleExportCSV = () => {
    exportToCSV<Lead>('crm_leads_pipeline', filteredLeads, [
      { key: 'id', label: 'Lead ID' },
      { key: 'leadName', label: 'Lead Name' },
      { key: 'company', label: 'Company' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'estimatedValue', label: 'Estimated Value (₹)' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Source' },
      { key: 'assignedEmployeeName', label: 'Assigned Staff' },
      { key: 'followUpDate', label: 'Follow Up Date' },
    ]);
  };

  const priorityVariant = (p: PriorityLevel) => {
    switch (p) {
      case 'Urgent':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const statusVariant = (s: LeadStatus) => {
    switch (s) {
      case 'New':
        return 'secondary';
      case 'Contacted':
        return 'info';
      case 'Qualified':
        return 'primary';
      case 'Proposal':
        return 'purple';
      case 'Converted':
        return 'success';
      case 'Lost':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const moveLeadStage = async (lead: Lead, newStatus: LeadStatus) => {
    if (newStatus === 'Converted') {
      setLeadToConvert(lead);
    } else {
      await handleUpdateLead({ ...lead, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Leads &amp; Qualification Pipeline
            </h1>
            <Badge variant="warning" size="md">
              {filteredLeads.length} Prospects
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Capture, nurture, qualify, and convert potential clients into permanent accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-3d-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => openQuickAdd('lead')}
            className="btn-3d-amber px-3.5 py-1.5 text-xs flex items-center gap-1.5"
            title="Quick Add Lead"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Quick Add</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-3d-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            Full Form
          </button>
        </div>
      </div>

      {/* Mini Metric KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{stats.totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Pipeline</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            ${stats.pipelineValue.toLocaleString()}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Converted to Customers</span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{stats.convertedCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Conversion Rate</span>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400">{stats.rate}%</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads, company, interest..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Lead Sources</option>
              <option value="Website Inbound">Website Inbound</option>
              <option value="Trade Show">Trade Show</option>
              <option value="LinkedIn Campaign">LinkedIn Campaign</option>
              <option value="Referral">Referral</option>
              <option value="Cold Outreach">Cold Outreach</option>
            </select>
          </div>

          <div>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Sales Reps</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clean Slate Empty State */}
      {filteredLeads.length === 0 && (
        <div className="card-3d p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
          <EmptyState
            icon={UserCheck}
            title="Lead pipeline is ready"
            description="No prospects currently in pipeline. Capture your first inbound inquiry or prospective client instantly using the 3D Quick Add overlay."
            actionLabel="Quick Add Lead (Q)"
            onAction={() => openQuickAdd('lead')}
          />
        </div>
      )}

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && filteredLeads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 items-start">
          {statuses.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);
            const totalStageValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

            return (
              <div
                key={stage}
                className="bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800 flex flex-col max-h-[78vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatINRCompact(totalStageValue)}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition group"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <Badge size="sm" variant={priorityVariant(lead.priority)}>
                          {lead.priority}
                        </Badge>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                          {formatINR(lead.estimatedValue)}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lead.leadName}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {lead.company}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                        {lead.interest}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate">{lead.assignedEmployeeName.split(' ')[0]}</span>
                        <div className="flex items-center gap-1">
                          {lead.status !== 'Converted' && (
                            <button
                              onClick={() => setLeadToConvert(lead)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                              title="Convert to Customer"
                            >
                              Convert
                            </button>
                          )}
                          <button
                            onClick={() => setLeadToEdit(lead)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 transition"
                            title="Edit Lead"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Quick stage advance buttons */}
                      <div className="mt-2 flex items-center gap-1">
                        <select
                          value={lead.status}
                          onChange={(e) => moveLeadStage(lead, e.target.value as LeadStatus)}
                          className="w-full text-[10px] py-0.5 px-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>
                              Move to: {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="p-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                      No leads in {stage}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Lead Name</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Est. Value (₹)</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Rep</th>
                  <th className="py-3.5 px-4">Follow-up</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {lead.leadName}
                      <span className="block text-[10px] text-slate-400 font-normal">{lead.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{lead.company}</span>
                      <span className="text-[10px] text-slate-400">{lead.interest}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {formatINR(lead.estimatedValue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={priorityVariant(lead.priority)} size="sm">
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusVariant(lead.status)} size="sm">
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {lead.assignedEmployeeName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {lead.followUpDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.status !== 'Converted' && (
                          <button
                            onClick={() => setLeadToConvert(lead)}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 rounded-lg transition"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => setLeadToEdit(lead)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setLeadToDelete(lead)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredLeads.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Modals */}
      <LeadFormModal
        isOpen={isAddOpen || !!leadToEdit}
        onClose={() => {
          setIsAddOpen(false);
          setLeadToEdit(null);
        }}
        leadToEdit={leadToEdit}
      />

      <ConvertLeadModal
        isOpen={!!leadToConvert}
        onClose={() => setLeadToConvert(null)}
        lead={leadToConvert}
      />

      <ConfirmModal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={() => {
          if (leadToDelete) {
            handleDeleteLead(leadToDelete.id);
            setLeadToDelete(null);
          }
        }}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.leadName}" (${leadToDelete?.company})?`}
      />
    </div>
  );
};
