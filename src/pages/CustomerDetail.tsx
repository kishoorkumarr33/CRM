import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CheckSquare,
  MessageSquare,
  Plus,
  PhoneCall,
  Video,
  FileText,
  IndianRupee,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Badge } from '../components/common/Badge';
import { InteractionType, Deal, Task, Interaction } from '../types/crm';
import { InteractionFormModal } from '../components/forms/InteractionFormModal';
import { formatINR } from '../utils/formatCurrency';
import { DealFormModal } from '../components/forms/DealFormModal';
import { TaskFormModal } from '../components/forms/TaskFormModal';
import { CustomerFormModal } from '../components/forms/CustomerFormModal';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onBack }) => {
  const { customers, deals, tasks, interactions, handleToggleTaskStatus } = useCRM();

  const customer = customers.find((c) => c.id === customerId);

  // Modals state
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);

  // Active Tab: 'timeline' | 'deals' | 'tasks' | 'notes'
  const [activeTab, setActiveTab] = useState<'timeline' | 'deals' | 'tasks'>('timeline');

  // Customer deals
  const customerDeals = useMemo(() => {
    return deals.filter((d) => d.customerId === customerId);
  }, [deals, customerId]);

  // Customer tasks
  const customerTasks = useMemo(() => {
    return tasks.filter((t) => t.relatedId === customerId || t.relatedName?.includes(customer?.company || ''));
  }, [tasks, customerId, customer]);

  // Customer timeline interactions
  const customerInteractions = useMemo(() => {
    return interactions.filter((i) => i.customerId === customerId);
  }, [interactions, customerId]);

  // Revenue metrics for this customer
  const totalWonRevenue = customerDeals
    .filter((d) => d.stage === 'Won')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const activePipelineValue = customerDeals
    .filter((d) => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Customer account not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const interactionIconMap = {
    Call: <PhoneCall className="w-4 h-4 text-sky-600" />,
    Meeting: <Video className="w-4 h-4 text-purple-600" />,
    Email: <Mail className="w-4 h-4 text-indigo-600" />,
    Note: <FileText className="w-4 h-4 text-amber-600" />,
  };

  return (
    <div className="space-y-6">
      {/* Top back & action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLogActivityOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            Log Activity
          </button>

          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            Add Task
          </button>

          <button
            onClick={() => setIsAddDealOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </button>
        </div>
      </div>

      {/* Customer 360 Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {customer.name}
                </h1>
                <Badge variant={customer.status === 'Active' ? 'success' : 'secondary'} size="sm">
                  {customer.status}
                </Badge>
                <Badge variant="primary" size="sm">
                  {customer.customerType}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {customer.company} • <span className="text-xs text-slate-400">{customer.industry}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center gap-1 hover:text-indigo-600 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {customer.email}
                </a>
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-1 hover:text-indigo-600 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </a>
                )}
                {(customer.city || customer.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[customer.address, customer.city, customer.state, customer.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 sm:items-end">
            <button
              onClick={() => setIsEditCustomerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Account Info
            </button>
            <div className="text-right text-xs text-slate-400">
              <span>Account Rep: </span>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                {customer.assignedEmployeeName}
              </strong>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Closed Revenue</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              ${totalWonRevenue.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Pipeline</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              ${activePipelineValue.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Deals</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{customerDeals.length} Deals</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Last Touchpoint</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono text-sm">
              {customer.lastContactDate || 'Recent'}
            </span>
          </div>
        </div>
      </div>

      {/* Notes & Overview Card */}
      {customer.notes && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
            Account Notes & Background
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {customer.notes}
          </p>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 transition relative ${
            activeTab === 'timeline'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Activity Timeline ({customerInteractions.length})
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`pb-3 transition relative ${
            activeTab === 'deals'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Sales Opportunities & Deals ({customerDeals.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 transition relative ${
            activeTab === 'tasks'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Action Tasks & Follow-ups ({customerTasks.length})
        </button>
      </div>

      {/* Tab 1: Interactive Activity Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Communication Timeline</h3>
            <button
              onClick={() => setIsLogActivityOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              + Log New Touchpoint
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {customerInteractions.map((item) => (
              <div key={item.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 flex items-center justify-center -translate-x-1/2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-white dark:bg-slate-700 shadow-2xs">
                        {interactionIconMap[item.type]}
                      </span>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.summary}
                      </strong>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  </div>

                  {item.details && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.details}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                    <span>Logged by: {item.employeeName}</span>
                    {item.outcome && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Outcome: {item.outcome}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {customerInteractions.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                No communications logged yet for this account.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Deals list */}
      {activeTab === 'deals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Associated Deals</h3>
            <button
              onClick={() => setIsAddDealOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              + Create Deal
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Deal Name</th>
                  <th className="py-3 px-4">Value (₹)</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4">Closing Date</th>
                  <th className="py-3 px-4">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerDeals.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {d.dealName}
                      <span className="block text-[10px] text-slate-400 font-normal">{d.dealType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      {formatINR(d.value)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={d.stage === 'Won' ? 'success' : d.stage === 'Lost' ? 'danger' : 'primary'}
                        size="sm"
                      >
                        {d.stage}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">{d.probability}%</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {d.actualClosingDate || d.expectedClosingDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {d.assignedEmployeeName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tasks list */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Follow-up Tasks</h3>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              + Add Task
            </button>
          </div>

          <div className="space-y-2">
            {customerTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Due: {t.dueDate} • Assigned: {t.assignedEmployeeName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    size="sm"
                    variant={t.status === 'Completed' ? 'success' : t.priority === 'Urgent' ? 'danger' : 'warning'}
                  >
                    {t.status}
                  </Badge>
                  <button
                    onClick={() => handleToggleTaskStatus(t.id, t.status === 'Completed' ? 'Pending' : 'Completed')}
                    className="p-1 rounded text-slate-400 hover:text-emerald-600 transition"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {customerTasks.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No tasks assigned to this account.</p>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <InteractionFormModal
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
        defaultCustomerId={customerId}
      />

      <DealFormModal
        isOpen={isAddDealOpen}
        onClose={() => setIsAddDealOpen(false)}
        defaultCustomerId={customerId}
      />

      <TaskFormModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        defaultRelated={{
          type: 'customer',
          id: customer.id,
          name: customer.company || customer.name,
        }}
      />

      <CustomerFormModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        customerToEdit={customer}
      />
    </div>
  );
};
