import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Lead } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onConverted?: (customerId: string) => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onConverted,
}) => {
  const { customers, handleConvertLead } = useCRM();

  const [mode, setMode] = useState<'create_new' | 'link_existing'>('create_new');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lead) return null;

  // Check if existing customer matches email or company
  const matchingCustomer = customers.find(
    (c) =>
      c.email.toLowerCase() === lead.email.toLowerCase() ||
      (lead.company && c.company.toLowerCase() === lead.company.toLowerCase())
  );

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const cust = await handleConvertLead(
        lead,
        mode === 'link_existing' ? selectedCustomerId || matchingCustomer?.id : undefined
      );
      if (onConverted) onConverted(cust.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead to Customer Account"
      subtitle="Promote qualified prospect into an active CRM account"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Lead summary card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Lead Information
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Name:</span>{' '}
              <strong className="text-slate-800 dark:text-slate-200">{lead.leadName}</strong>
            </div>
            <div>
              <span className="text-slate-400">Company:</span>{' '}
              <strong className="text-slate-800 dark:text-slate-200">{lead.company}</strong>
            </div>
            <div>
              <span className="text-slate-400">Email:</span>{' '}
              <span className="text-slate-700 dark:text-slate-300">{lead.email}</span>
            </div>
            <div>
              <span className="text-slate-400">Estimated Value:</span>{' '}
              <strong className="text-emerald-600">${lead.estimatedValue.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {matchingCustomer && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 dark:text-amber-200 font-semibold block">
                Existing Match Found
              </strong>
              <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                Customer <strong>{matchingCustomer.name}</strong> ({matchingCustomer.company}) matches this lead&apos;s credentials. Linking will avoid duplicate records.
              </p>
            </div>
          </div>
        )}

        {/* Action Choice */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Conversion Strategy:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('create_new')}
              className={`p-3 rounded-xl border text-left text-xs transition ${
                mode === 'create_new'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-semibold ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="block font-bold text-sm mb-1">Create New Account</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Generates a new Customer Profile with details pre-filled.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('link_existing')}
              className={`p-3 rounded-xl border text-left text-xs transition ${
                mode === 'link_existing'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-semibold ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="block font-bold text-sm mb-1">Link to Existing Account</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Merge this qualified lead under an existing client account.
              </span>
            </button>
          </div>
        </div>

        {mode === 'link_existing' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Customer to Link:
            </label>
            <select
              value={selectedCustomerId || matchingCustomer?.id || ''}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">-- Choose existing customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.company} ({c.id})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || (mode === 'link_existing' && !selectedCustomerId && !matchingCustomer)}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Converting...' : 'Confirm Conversion'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
