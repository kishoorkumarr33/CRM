import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Task, TaskRelatedType, TaskStatus, PriorityLevel } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultRelated?: {
    type: TaskRelatedType;
    id: string;
    name: string;
  };
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultRelated,
}) => {
  const { tasks, customers, leads, deals, employees, handleCreateTask, handleUpdateTask } = useCRM();

  const isEditing = !!taskToEdit;

  const [formData, setFormData] = useState<Task>({
    id: '',
    title: '',
    description: '',
    relatedType: 'general',
    relatedId: '',
    relatedName: '',
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
    } else {
      const nextId = `TSK-${4000 + tasks.length + 1}`;
      const defaultEmp = employees[0] || { id: 'EMP-101', name: 'Nkishoor Kumar' };

      setFormData({
        id: nextId,
        title: '',
        description: '',
        relatedType: defaultRelated?.type || 'customer',
        relatedId: defaultRelated?.id || (customers[0]?.id || ''),
        relatedName: defaultRelated?.name || (customers[0]?.name || ''),
        assignedEmployeeId: defaultEmp.id,
        assignedEmployeeName: defaultEmp.name,
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [taskToEdit, isOpen, defaultRelated, tasks.length, customers, employees]);

  const handleRelatedTypeChange = (type: TaskRelatedType) => {
    let relId = '';
    let relName = '';
    if (type === 'customer' && customers[0]) {
      relId = customers[0].id;
      relName = customers[0].company || customers[0].name;
    } else if (type === 'lead' && leads[0]) {
      relId = leads[0].id;
      relName = leads[0].leadName;
    } else if (type === 'deal' && deals[0]) {
      relId = deals[0].id;
      relName = deals[0].dealName;
    }
    setFormData({
      ...formData,
      relatedType: type,
      relatedId: relId,
      relatedName: relName,
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Task title is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await handleUpdateTask(formData);
      } else {
        await handleCreateTask(formData);
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
      title={isEditing ? `Edit Task (${formData.id})` : 'Create Follow-up Task'}
      subtitle="Assign action items, set priority and deadline"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Follow up on QBR presentation & contract addendum"
            className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
              errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            } text-slate-900 dark:text-white`}
          />
          {errors.title && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.title}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Related To
            </label>
            <select
              value={formData.relatedType}
              onChange={(e) => handleRelatedTypeChange(e.target.value as TaskRelatedType)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="customer">Customer</option>
              <option value="lead">Lead</option>
              <option value="deal">Deal</option>
              <option value="general">General / Internal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Associated Record
            </label>
            {formData.relatedType === 'customer' && (
              <select
                value={formData.relatedId}
                onChange={(e) => {
                  const c = customers.find((x) => x.id === e.target.value);
                  setFormData({ ...formData, relatedId: e.target.value, relatedName: c ? c.company || c.name : '' });
                }}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            )}

            {formData.relatedType === 'lead' && (
              <select
                value={formData.relatedId}
                onChange={(e) => {
                  const l = leads.find((x) => x.id === e.target.value);
                  setFormData({ ...formData, relatedId: e.target.value, relatedName: l ? l.leadName : '' });
                }}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.leadName} ({l.company})
                  </option>
                ))}
              </select>
            )}

            {formData.relatedType === 'deal' && (
              <select
                value={formData.relatedId}
                onChange={(e) => {
                  const d = deals.find((x) => x.id === e.target.value);
                  setFormData({ ...formData, relatedId: e.target.value, relatedName: d ? d.dealName : '' });
                }}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.dealName} (${d.value.toLocaleString()})
                  </option>
                ))}
              </select>
            )}

            {formData.relatedType === 'general' && (
              <input
                type="text"
                placeholder="Internal Task"
                disabled
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Staff
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
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className={`w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.dueDate ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              } text-slate-900 dark:text-white`}
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Pending', 'In Progress', 'Completed', 'Cancelled'] as TaskStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFormData({ ...formData, status: st })}
                className={`py-2 text-xs font-semibold rounded-xl border transition ${
                  formData.status === st
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description & Instructions
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed checklist or action item description..."
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
