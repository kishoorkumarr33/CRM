import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Lead, LeadStatus, PriorityLevel } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  leadToEdit,
}) => {
  const { leads, employees, handleCreateLead, handleUpdateLead } = useCRM();

  const isEditing = !!leadToEdit;

  const [formData, setFormData] = useState<Lead>({
    id: '',
    leadName: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website Inbound',
    interest: 'Cloud Migration',
    estimatedValue: 25000,
    priority: 'Medium',
    status: 'New',
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: '',
    createdDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setFormData(leadToEdit);
    } else {
      const nextId = `LEAD-${2000 + leads.length + 1}`;
      const defaultEmp = employees[0] || { id: 'EMP-101', name: 'Nkishoor Kumar' };
      setFormData({
        id: nextId,
        leadName: '',
        company: '',
        email: '',
        phone: '',
        source: 'Website Inbound',
        interest: 'Cloud Infrastructure',
        estimatedValue: 35000,
        priority: 'High',
        status: 'New',
        assignedEmployeeId: defaultEmp.id,
        assignedEmployeeName: defaultEmp.name,
        followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        notes: '',
        createdDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [leadToEdit, isOpen, leads.length, employees]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.leadName.trim()) errs.leadName = 'Lead contact name is required';
    if (!formData.company.trim()) errs.company = 'Company name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      errs.email = 'Valid email is required';
    }
    if (formData.estimatedValue < 0) errs.estimatedValue = 'Value cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await handleUpdateLead(formData);
      } else {
        await handleCreateLead(formData);
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
      title={isEditing ? `Edit Lead (${formData.id})` : 'Create Inbound / Prospect Lead'}
      subtitle="Track pipeline qualification and expected deal potential"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lead ID
            </label>
            <input
              type="text"
              value={formData.id}
              disabled
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lead Name *
            </label>
            <input
              type="text"
              value={formData.leadName}
              onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
              placeholder="e.g. Arthur Pendelton"
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.leadName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.leadName && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.leadName}</span>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Vanguard Cyber"
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.company ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.company && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.company}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="prospect@company.com"
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.email && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.email}</span>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lead Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Website Inbound">Website Inbound</option>
              <option value="Trade Show">Trade Show</option>
              <option value="LinkedIn Campaign">LinkedIn Campaign</option>
              <option value="Referral">Referral</option>
              <option value="Cold Outreach">Cold Outreach</option>
              <option value="Google Search Ads">Google Search Ads</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Deal Value (₹ INR)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.estimatedValue}
              onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent 🔥</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pipeline Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Sales Rep
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
              Follow-up Date
            </label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Interest & Solution Required
          </label>
          <input
            type="text"
            value={formData.interest}
            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
            placeholder="e.g. Telemetry Data Bridge, Enterprise Security Suite"
            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes & Discovery Findings
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Key discussion points, procurement timing, decision makers..."
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
