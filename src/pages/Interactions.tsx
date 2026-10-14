import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  PhoneCall,
  Video,
  Mail,
  FileText,
  Calendar,
  User,
  Trash2,
  Building2,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Interaction, InteractionType } from '../types/crm';
import { Badge } from '../components/common/Badge';
import { InteractionFormModal } from '../components/forms/InteractionFormModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';

interface InteractionsProps {
  onSelectCustomer?: (customerId: string) => void;
}

export const Interactions: React.FC<InteractionsProps> = ({ onSelectCustomer }) => {
  const { interactions, customers, handleDeleteInteraction } = useCRM();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [interactionToDelete, setInteractionToDelete] = useState<Interaction | null>(null);

  const filteredInteractions = useMemo(() => {
    return interactions.filter((item) => {
      const matchSearch =
        item.summary.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        item.details.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchCust = customerFilter === 'all' || item.customerId === customerFilter;

      return matchSearch && matchType && matchCust;
    });
  }, [interactions, search, typeFilter, customerFilter]);

  const typeIconMap = {
    Call: <PhoneCall className="w-4 h-4 text-sky-500" />,
    Meeting: <Video className="w-4 h-4 text-purple-500" />,
    Email: <Mail className="w-4 h-4 text-indigo-500" />,
    Note: <FileText className="w-4 h-4 text-amber-500" />,
  };

  const typeVariant = (t: InteractionType) => {
    switch (t) {
      case 'Call':
        return 'info';
      case 'Meeting':
        return 'purple';
      case 'Email':
        return 'primary';
      case 'Note':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Customer Communications &amp; Logs
            </h1>
            <Badge variant="primary" size="md">
              {filteredInteractions.length} Activities
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global touchpoint log recording calls, strategy meetings, sales proposals, and debrief notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Activity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations, notes, clients..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Channels</option>
              <option value="Call">Phone Call</option>
              <option value="Meeting">Meeting</option>
              <option value="Email">Email</option>
              <option value="Note">Internal Note</option>
            </select>
          </div>

          <div>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Customer Accounts</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactions Feed */}
      <div className="space-y-3">
        {filteredInteractions.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {typeIconMap[item.type]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.summary}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <button
                      onClick={() => onSelectCustomer && onSelectCustomer(item.customerId)}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Building2 className="w-3 h-3" />
                      {item.customerName}
                    </button>
                    <span>•</span>
                    <span>Logged by: {item.employeeName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge size="sm" variant={typeVariant(item.type)}>
                  {item.type}
                </Badge>
                <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                <button
                  onClick={() => setInteractionToDelete(item)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition ml-2"
                  title="Delete log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {item.details && (
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-11 mt-2 leading-relaxed">
                {item.details}
              </p>
            )}

            {item.outcome && (
              <div className="mt-3 ml-11 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Outcome:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.outcome}</span>
              </div>
            )}
          </div>
        ))}

        {filteredInteractions.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="No interactions recorded"
            description="Start logging customer conversations, calls, or meeting debriefs."
            actionLabel="Log Activity"
            onAction={() => setIsAddOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <InteractionFormModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <ConfirmModal
        isOpen={!!interactionToDelete}
        onClose={() => setInteractionToDelete(null)}
        onConfirm={() => {
          if (interactionToDelete) {
            handleDeleteInteraction(interactionToDelete.id);
            setInteractionToDelete(null);
          }
        }}
        title="Delete Activity Log"
        message={`Delete touchpoint record "${interactionToDelete?.summary}"?`}
      />
    </div>
  );
};
