import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Employee, UserRole } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
}) => {
  const { employees, handleCreateEmployee, handleUpdateEmployee } = useCRM();
  const { isAdmin } = useAuth();

  const isEditing = !!employeeToEdit;

  const [formData, setFormData] = useState<Employee>({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: 'Enterprise Sales',
    jobTitle: 'Account Executive',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    role: 'employee',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData(employeeToEdit);
    } else {
      const nextId = `EMP-${100 + employees.length + 1}`;
      setFormData({
        id: nextId,
        name: '',
        email: '',
        phone: '',
        department: 'Enterprise Sales',
        jobTitle: 'Account Executive',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        role: 'employee',
      });
    }
    setErrors({});
  }, [employeeToEdit, isOpen, employees.length]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Employee name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      errs.email = 'Valid corporate email required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await handleUpdateEmployee(formData);
      } else {
        await handleCreateEmployee(formData);
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
      title={isEditing ? `Edit Staff Member (${formData.id})` : 'Register New Employee'}
      subtitle="Configure corporate department, job title, and system role"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employee ID
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
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jessica Williams"
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white`}
            />
            {errors.name && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corporate Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@apexcrm.internal"
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white`}
            />
            {errors.email && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.email}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Direct Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 234-5678"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Executive Management">Executive Management</option>
              <option value="Sales Leadership">Sales Leadership</option>
              <option value="Enterprise Sales">Enterprise Sales</option>
              <option value="Business Development">Business Development</option>
              <option value="Customer Success">Customer Success</option>
              <option value="Solutions Architecture">Solutions Architecture</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder="e.g. Senior Account Executive"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              System Role {isAdmin ? '(Admin Config)' : '(Read Only)'}
            </label>
            <select
              value={formData.role}
              disabled={!isAdmin}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-60 font-semibold"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employment Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Deactivated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Joining Date
            </label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Staff Profile' : 'Register Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
