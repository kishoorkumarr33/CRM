import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Interaction, InteractionType } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';

interface InteractionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
}

export const InteractionFormModal: React.FC<InteractionFormModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
}) => {
  const { customers, handleCreateInteraction } = useCRM();
  const { userProfile } = useAuth();

  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState<InteractionType>('Call');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [outcome, setOutcome] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialCust = defaultCustomerId
        ? customers.find((c) => c.id === defaultCustomerId) || customers[0]
        : customers[0];
      setCustomerId(initialCust?.id || '');
      setType('Call');
      setSummary('');
      setDetails('');
      setOutcome('');
      const now = new Date();
      setDate(now.toISOString().replace('T', ' ').substring(0, 16));
      setErrors({});
    }
  }, [isOpen, defaultCustomerId, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setErrors({ summary: 'Summary is required' });
      return;
    }
    if (!customerId) {
      setErrors({ customerId: 'Please select a customer' });
      return;
    }

    const selectedCust = customers.find((c) => c.id === customerId);

    const interaction: Interaction = {
      id: `INT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      customerId,
      customerName: selectedCust ? selectedCust.company || selectedCust.name : 'Unknown Customer',
      type,
      summary,
      details,
      date: date || new Date().toISOString().replace('T', ' ').substring(0, 16),
      employeeId: userProfile?.uid || 'EMP-101',
      employeeName: userProfile?.displayName || 'CRM Staff',
      outcome,
    };

    setIsSubmitting(true);
    try {
      await handleCreateInteraction(interaction);
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
      title="Log Customer Activity"
      subtitle="Record phone calls, meetings, emails, or internal briefing notes"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Account *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
            {errors.customerId && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.customerId}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Communication Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Call', 'Meeting', 'Email', 'Note'] as InteractionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    type === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Activity Summary *
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Discussed Q3 SLA addendum with VP of Tech"
            className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
              errors.summary ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            } text-slate-900 dark:text-white`}
          />
          {errors.summary && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.summary}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date & Time
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="YYYY-MM-DD HH:MM"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Outcome / Next Action
            </label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. Sent revised proposal; follow up on Tuesday"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Detailed Meeting / Conversation Notes
          </label>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Log verbatim conversation items, concerns raised, and agreements made..."
            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
          >
            {isSubmitting ? 'Saving...' : 'Log Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
