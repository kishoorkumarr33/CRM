import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Plus,
  Search,
  Filter,
  Shield,
  Briefcase,
  Users,
  CheckSquare,
  IndianRupee,
  Edit,
  Trash2,
  Mail,
  Phone,
  Power,
  Lock,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { Employee, UserRole } from '../types/crm';
import { Badge } from '../components/common/Badge';
import { EmployeeFormModal } from '../components/forms/EmployeeFormModal';
import { formatINRCompact } from '../utils/formatCurrency';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';

export const Employees: React.FC = () => {
  const { employees, customers, leads, deals, tasks, handleDeleteEmployee, handleUpdateEmployee } = useCRM();
  const { isAdmin, isManager, role } = useAuth();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase());

      const matchDept = deptFilter === 'all' || emp.department === deptFilter;
      const matchRole = roleFilter === 'all' || emp.role === roleFilter;

      return matchSearch && matchDept && matchRole;
    });
  }, [employees, search, deptFilter, roleFilter]);

  const toggleStatus = async (emp: Employee) => {
    const updatedStatus: 'Active' | 'Inactive' = emp.status === 'Active' ? 'Inactive' : 'Active';
    await handleUpdateEmployee({ ...emp, status: updatedStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Employee Directory &amp; Staff
            </h1>
            <Badge variant="primary" size="md">
              {filteredEmployees.length} Staff Members
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage organization hierarchy, departments, territory coverage, and role permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isManager && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Permission Callout Banner */}
      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Role-Based Access: Viewing as <strong>{role.toUpperCase()}</strong>. System role modifications and account deactivations require Administrator credentials.
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff name, email, role, or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          // Calculate individual metrics for this employee
          const assignedCustCount = customers.filter(
            (c) => c.assignedEmployeeId === emp.id || c.assignedEmployeeName === emp.name
          ).length;

          const assignedLeadsCount = leads.filter(
            (l) => l.assignedEmployeeId === emp.id || l.assignedEmployeeName === emp.name
          ).length;

          const wonRev = deals
            .filter((d) => (d.assignedEmployeeId === emp.id || d.assignedEmployeeName === emp.name) && d.stage === 'Won')
            .reduce((sum, d) => sum + (d.value || 0), 0);

          const pendingTasksCount = tasks.filter(
            (t) => (t.assignedEmployeeId === emp.id || t.assignedEmployeeName === emp.name) && t.status !== 'Completed'
          ).length;

          return (
            <div
              key={emp.id}
              className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border transition shadow-xs ${
                emp.status === 'Inactive'
                  ? 'border-slate-200 dark:border-slate-800 opacity-60'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-extrabold text-base flex items-center justify-center uppercase shadow-xs">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {emp.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                      {emp.jobTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{emp.id}</span>
                  </div>
                </div>

                <Badge
                  size="sm"
                  variant={emp.role === 'admin' ? 'purple' : emp.role === 'manager' ? 'primary' : 'secondary'}
                >
                  {emp.role.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">{emp.department}</span>
                </div>
              </div>

              {/* Performance Summary Pill Grid */}
              <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Accounts</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{assignedCustCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Leads</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{assignedLeadsCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Won</span>
                  <span className="text-xs font-black text-emerald-600">
                    {formatINRCompact(wonRev)}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Tasks</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{pendingTasksCount}</span>
                </div>
              </div>

              {/* Action Buttons for Managers/Admins */}
              {isManager && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleStatus(emp)}
                    className={`flex items-center gap-1 font-semibold ${
                      emp.status === 'Active'
                        ? 'text-slate-500 hover:text-amber-600'
                        : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {emp.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEmployeeToEdit(emp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                      title="Edit Staff Member"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setEmployeeToDelete(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <EmptyState
          icon={UserPlus}
          title="No employees found"
          description="Try adjusting your department or role filters."
          actionLabel={isManager ? 'Add Employee' : undefined}
          onAction={() => setIsAddOpen(true)}
        />
      )}

      {/* Modals */}
      <EmployeeFormModal
        isOpen={isAddOpen || !!employeeToEdit}
        onClose={() => {
          setIsAddOpen(false);
          setEmployeeToEdit(null);
        }}
        employeeToEdit={employeeToEdit}
      />

      <ConfirmModal
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={() => {
          if (employeeToDelete) {
            handleDeleteEmployee(employeeToDelete.id);
            setEmployeeToDelete(null);
          }
        }}
        title="Delete Employee Account"
        message={`Are you sure you want to remove staff member "${employeeToDelete?.name}"?`}
      />
    </div>
  );
};
