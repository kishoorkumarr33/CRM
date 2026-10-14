import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Deal, DealStage } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealToEdit?: Deal | null;
  defaultCustomerId?: string;
}

export const DealFormModal: React.FC<DealFormModalProps> = ({
  isOpen,
  onClose,
  dealToEdit,
  defaultCustomerId,
}) => {
  const { deals, customers, employees, handleCreateDeal, handleUpdateDeal } = useCRM();

  const isEditing = !!dealToEdit;

  const [formData, setFormData] = useState<Deal>({
    id: '',
    dealName: '',
    customerId: '',
    customerName: '',
    value: 50000,
    stage: 'Discovery',
    probability: 20,
    expectedClosingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    dealType: 'New Business',
    notes: '',
    createdDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dealToEdit) {
      setFormData(dealToEdit);
    } else {
      const nextId = `DEAL-${3000 + deals.length + 1}`;
      const initialCust = defaultCustomerId
        ? customers.find((c) => c.id === defaultCustomerId) || customers[0]
        : customers[0];
      const initialEmp = employees[0] || { id: 'EMP-101', name: 'Nkishoor Kumar' };

      setFormData({
        id: nextId,
        dealName: initialCust ? `${initialCust.company || initialCust.name} Opportunity` : '',
        customerId: initialCust ? initialCust.id : '',
        customerName: initialCust ? (initialCust.company || initialCust.name) : '',
        value: 50000,
        stage: 'Discovery',
        probability: 20,
        expectedClosingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        assignedEmployeeId: initialEmp.id,
        assignedEmployeeName: initialEmp.name,
        dealType: 'New Business',
        notes: '',
        createdDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [dealToEdit, isOpen, defaultCustomerId, deals.length, customers, employees]);

  const handleStageChange = (newStage: DealStage) => {
    const probMap: Record<DealStage, number> = {
      Discovery: 20,
      Qualification: 40,
      Proposal: 60,
      Negotiation: 80,
      Won: 100,
      Lost: 0,
    };
    setFormData({
      ...formData,
      stage: newStage,
      probability: probMap[newStage],
      actualClosingDate: newStage === 'Won' || newStage === 'Lost' ? new Date().toISOString().split('T')[0] : formData.actualClosingDate,
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.dealName.trim()) errs.dealName = 'Deal name is required';
    if (!formData.customerId) errs.customerId = 'Associated customer is required';
    if (formData.value <= 0) errs.value = 'Value must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await handleUpdateDeal(formData);
      } else {
        await handleCreateDeal(formData);
      }
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
      title={isEditing ? `Edit Deal (${formData.id})` : 'Create Sales Deal / Opportunity'}
      subtitle="Track pipeline values, closing dates, and probability"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deal ID
            </label>
            <input
              type="text"
              value={formData.id}
              disabled
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deal Name *
            </label>
            <input
              type="text"
              value={formData.dealName}
              onChange={(e) => setFormData({ ...formData, dealName: e.target.value })}
              placeholder="e.g. Acme Corp - Global Expansion"
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.dealName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white`}
            />
            {errors.dealName && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.dealName}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Account *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => {
                const cust = customers.find((c) => c.id === e.target.value);
                setFormData({
                  ...formData,
                  customerId: e.target.value,
                  customerName: cust ? cust.company || cust.name : '',
                });
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.company} ({c.id})
                </option>
              ))}
            </select>
            {errors.customerId && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.customerId}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deal Value (₹ INR) *
            </label>
            <input
              type="number"
              min="1"
              step="500"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-emerald-600"
            />
            {errors.value && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.value}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pipeline Stage
            </label>
            <select
              value={formData.stage}
              onChange={(e) => handleStageChange(e.target.value as DealStage)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            >
              <option value="Discovery">Discovery (20%)</option>
              <option value="Qualification">Qualification (40%)</option>
              <option value="Proposal">Proposal (60%)</option>
              <option value="Negotiation">Negotiation (80%)</option>
              <option value="Won">Closed Won (100%) 🎉</option>
              <option value="Lost">Closed Lost (0%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Win Probability (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expected Close Date
            </label>
            <input
              type="date"
              value={formData.expectedClosingDate}
              onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Representative
            </label>
            <select
              value={formData.assignedEmployeeId}
              onChange={(e) => {
                const emp = employees.find((x) => x.id === e.target.value);
                setFormData({
                  ...formData,
                  assignedEmployeeId: e.target.value,
                  assignedEmployeeName: emp ? emp.name : '',
                });
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deal Classification
            </label>
            <select
              value={formData.dealType}
              onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="New Business">New Business</option>
              <option value="Expansion">Expansion / Upsell</option>
              <option value="Renewal">Renewal</option>
              <option value="Strategic Partnership">Strategic Partnership</option>
              <option value="Pilot Integration">Pilot Integration</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deal Notes & Scope
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Contractual details, deliverable milestones, discount approvals..."
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Deal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
