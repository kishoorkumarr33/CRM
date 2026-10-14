import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Customer, CustomerType, CustomerStatus } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { customers, employees, handleCreateCustomer, handleUpdateCustomer } = useCRM();

  const isEditing = !!customerToEdit;

  const [formData, setFormData] = useState<Customer>({
    id: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    industry: 'Technology & SaaS',
    customerType: 'Mid-Market',
    source: 'Website Inbound',
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    status: 'Active',
    notes: '',
    createdDate: new Date().toISOString().split('T')[0],
    lastContactDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customerToEdit) {
      setFormData(customerToEdit);
    } else {
      const nextId = `CUST-${1000 + customers.length + 1}`;
      const defaultEmp = employees[0] || { id: 'EMP-101', name: 'Nkishoor Kumar' };
      setFormData({
        id: nextId,
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'United States',
        industry: 'Technology & SaaS',
        customerType: 'Mid-Market',
        source: 'Website Inbound',
        assignedEmployeeId: defaultEmp.id,
        assignedEmployeeName: defaultEmp.name,
        status: 'Active',
        notes: '',
        createdDate: new Date().toISOString().split('T')[0],
        lastContactDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [customerToEdit, isOpen, customers.length, employees]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full contact name is required';
    if (!formData.email.trim()) {
      errs.email = 'Valid email is required';
    } else if (!formData.email.includes('@')) {
      errs.email = 'Please provide a valid email format';
    }
    if (!formData.company.trim()) errs.company = 'Company name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await handleUpdateCustomer(formData);
      } else {
        await handleCreateCustomer(formData);
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
      title={isEditing ? `Edit Customer (${formData.id})` : 'Add New Customer'}
      subtitle="Complete profile and assign relationship manager"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer ID
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
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Robert Hastings"
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.name && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name}</span>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Apex Cloud Solutions"
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
              Business Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. r.hastings@apexcloud.io"
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
              placeholder="+1 (555) 000-0000"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="450 Mission St, Suite 1200"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="San Francisco"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              State / Region
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="CA"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g. Finance, Healthcare"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Segment
            </label>
            <select
              value={formData.customerType}
              onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Acquisition Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Website Inbound">Website Inbound</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn Campaign">LinkedIn Campaign</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Cold Outreach">Cold Outreach</option>
              <option value="Google Search Ads">Google Search Ads</option>
              <option value="Partner">Partner</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Account Manager
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
              Account Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Lead">Lead</option>
              <option value="Churned">Churned</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes & Relationship Background
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Account background, contract terms, or special requirements..."
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
