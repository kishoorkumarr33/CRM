import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  Edit,
  Trash2,
  Download,
  Award,
  Zap,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Deal, DealStage } from '../types/crm';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { DealFormModal } from '../components/forms/DealFormModal';
import { formatINR } from '../utils/formatCurrency';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCSV } from '../utils/csv';
import { EmptyState } from '../components/common/EmptyState';

export const Deals: React.FC = () => {
  const { deals, customers, employees, handleDeleteDeal, handleUpdateDealStage, openQuickAdd } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  // Pagination for list view
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const stages: DealStage[] = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      const matchSearch =
        d.dealName.toLowerCase().includes(search.toLowerCase()) ||
        d.customerName.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase());

      const matchStage = stageFilter === 'all' || d.stage === stageFilter;
      const matchAssigned = assignedFilter === 'all' || d.assignedEmployeeId === assignedFilter;

      return matchSearch && matchStage && matchAssigned;
    });
  }, [deals, search, stageFilter, assignedFilter]);

  const paginatedDeals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDeals.slice(start, start + pageSize);
  }, [filteredDeals, currentPage, pageSize]);

  // Strict revenue calculation: only from Closed Won deals
  const wonDeals = useMemo(() => deals.filter((d) => d.stage === 'Won'), [deals]);
  const totalWonRevenue = useMemo(() => wonDeals.reduce((sum, d) => sum + (d.value || 0), 0), [wonDeals]);

  // Active pipeline value: all non-terminal deals
  const activeDeals = useMemo(() => deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost'), [deals]);
  const activePipelineValue = useMemo(() => activeDeals.reduce((sum, d) => sum + (d.value || 0), 0), [activeDeals]);

  const stageVariant = (st: DealStage) => {
    switch (st) {
      case 'Discovery':
        return 'secondary';
      case 'Qualification':
        return 'info';
      case 'Proposal':
        return 'primary';
      case 'Negotiation':
        return 'warning';
      case 'Won':
        return 'success';
      case 'Lost':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const handleExportCSV = () => {
    exportToCSV<Deal>('sales_deals_pipeline', filteredDeals, [
      { key: 'id', label: 'Deal ID' },
      { key: 'dealName', label: 'Deal Name' },
      { key: 'customerName', label: 'Customer' },
      { key: 'value', label: 'Value (₹)' },
      { key: 'stage', label: 'Stage' },
      { key: 'probability', label: 'Probability (%)' },
      { key: 'assignedEmployeeName', label: 'Owner' },
      { key: 'expectedClosingDate', label: 'Expected Close' },
      { key: 'actualClosingDate', label: 'Actual Close' },
      { key: 'dealType', label: 'Type' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sales Pipeline &amp; Deals
            </h1>
            <Badge variant="primary" size="md">
              {filteredDeals.length} Opportunities
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track revenue progression, close rates, and deal stages from discovery to execution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            onClick={() => openQuickAdd('deal')}
            className="btn-3d-emerald px-3.5 py-1.5 text-xs flex items-center gap-1.5"
            title="Quick Add Deal"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Quick Add</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-3d-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            Full Form
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Deals</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{deals.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Closed Won Revenue</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalWonRevenue.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Strictly closed won ({wonDeals.length} deals)</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Pipeline Value</span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            ${activePipelineValue.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Excludes won & lost ({activeDeals.length} deals)</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Deal Size</span>
          <span className="text-xl font-black text-sky-600 dark:text-sky-400">
            ${deals.length > 0 ? Math.round((totalWonRevenue + activePipelineValue) / deals.length).toLocaleString() : 0}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals, customers, IDs..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Pipeline Stages</option>
              {stages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Sales Owners</option>
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
      {filteredDeals.length === 0 && (
        <div className="card-3d p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
          <EmptyState
            icon={Briefcase}
            title="Sales pipeline is empty"
            description="No active deals currently recorded. Quickly create your first sales opportunity or won contract using the 3D Quick Add overlay."
            actionLabel="Quick Add Deal (Q)"
            onAction={() => openQuickAdd('deal')}
          />
        </div>
      )}

      {/* VIEW 1: KANBAN PIPELINE */}
      {viewMode === 'kanban' && filteredDeals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 items-start">
          {stages.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage);
            const totalStageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div
                key={stage}
                className="bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800 flex flex-col max-h-[78vh]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${(totalStageValue / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition group"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatINR(deal.value)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">{deal.probability}% Prob</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {deal.dealName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {deal.customerName}
                      </p>

                      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Close: {deal.expectedClosingDate}</span>
                        <span className="truncate">{deal.assignedEmployeeName.split(' ')[0]}</span>
                      </div>

                      {/* Quick stage transition buttons */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                        {deal.stage !== 'Won' && (
                          <button
                            onClick={() => handleUpdateDealStage(deal.id, 'Won')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 transition"
                            title="Mark Won"
                          >
                            Mark Won 🎉
                          </button>
                        )}
                        {deal.stage !== 'Lost' && (
                          <button
                            onClick={() => handleUpdateDealStage(deal.id, 'Lost')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 transition"
                            title="Mark Lost"
                          >
                            Lost
                          </button>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => setDealToEdit(deal)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDealToDelete(deal)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="p-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                      Empty stage
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
                  <th className="py-3.5 px-4">Deal Name</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Value (₹)</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Win Prob</th>
                  <th className="py-3.5 px-4">Close Date</th>
                  <th className="py-3.5 px-4">Rep</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {deal.dealName}
                      <span className="block text-[10px] text-slate-400 font-mono">{deal.id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {deal.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-600">
                      {formatINR(deal.value)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={stageVariant(deal.stage)} size="sm">
                        {deal.stage}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">{deal.probability}%</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {deal.actualClosingDate || deal.expectedClosingDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {deal.assignedEmployeeName}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {deal.stage !== 'Won' && (
                          <button
                            onClick={() => handleUpdateDealStage(deal.id, 'Won')}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 rounded-lg transition"
                          >
                            Won
                          </button>
                        )}
                        <button
                          onClick={() => setDealToEdit(deal)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDealToDelete(deal)}
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
            totalItems={filteredDeals.length}
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
      <DealFormModal
        isOpen={isAddOpen || !!dealToEdit}
        onClose={() => {
          setIsAddOpen(false);
          setDealToEdit(null);
        }}
        dealToEdit={dealToEdit}
      />

      <ConfirmModal
        isOpen={!!dealToDelete}
        onClose={() => setDealToDelete(null)}
        onConfirm={() => {
          if (dealToDelete) {
            handleDeleteDeal(dealToDelete.id);
            setDealToDelete(null);
          }
        }}
        title="Delete Deal"
        message={`Are you sure you want to remove deal "${dealToDelete?.dealName}" (${formatINR(dealToDelete?.value)})?`}
      />
    </div>
  );
};
