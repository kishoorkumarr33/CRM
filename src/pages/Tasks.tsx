import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  List,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  User,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Task, TaskStatus, PriorityLevel } from '../types/crm';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { TaskFormModal } from '../components/forms/TaskFormModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';

export const Tasks: React.FC = () => {
  const { tasks, employees, handleToggleTaskStatus, handleDeleteTask, openQuickAdd } = useCRM();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Pagination for list view
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.relatedName && t.relatedName.toLowerCase().includes(search.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchAssigned = assignedFilter === 'all' || t.assignedEmployeeId === assignedFilter;

      return matchSearch && matchStatus && matchPriority && matchAssigned;
    });
  }, [tasks, search, statusFilter, priorityFilter, assignedFilter]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  // Overdue count
  const overdueTasksCount = useMemo(() => {
    return tasks.filter((t) => t.dueDate < todayStr && t.status !== 'Completed' && t.status !== 'Cancelled').length;
  }, [tasks, todayStr]);

  const priorityVariant = (p: PriorityLevel) => {
    switch (p) {
      case 'Urgent':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const statusVariant = (s: TaskStatus) => {
    switch (s) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  // Group tasks by dueDate for Calendar View
  const calendarDays = useMemo(() => {
    const map: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
      const day = t.dueDate || 'Unscheduled';
      if (!map[day]) map[day] = [];
      map[day].push(t);
    });
    return Object.entries(map).sort(([dayA], [dayB]) => dayA.localeCompare(dayB));
  }, [filteredTasks]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Task &amp; Follow-up Management
            </h1>
            <Badge variant="danger" size="md">
              {filteredTasks.length} Action Items
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Coordinate customer outreach, follow-ups, proposal delivery, and internal checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Schedule Calendar
            </button>
          </div>

          <button
            onClick={() => openQuickAdd('task')}
            className="btn-3d-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
            title="Quick Add Task"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Quick Add</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-3d-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            Full Form
          </button>
        </div>
      </div>

      {/* Overdue Warning Callout */}
      {overdueTasksCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-rose-900 dark:text-rose-200 font-bold text-sm block">
                {overdueTasksCount} Overdue Follow-up {overdueTasksCount === 1 ? 'Task' : 'Tasks'} Require Action
              </strong>
              <span className="text-rose-700 dark:text-rose-300">
                Action deadlines passed without marked completion. Check with assigned representatives.
              </span>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Pending')}
            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-200/60 hover:bg-rose-200 rounded-xl transition shrink-0"
          >
            Filter Pending
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, descriptions..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent 🔥</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Assignees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clean Slate Empty State */}
      {filteredTasks.length === 0 && (
        <div className="card-3d p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
          <EmptyState
            icon={CheckSquare}
            title="All caught up"
            description="No pending tasks or follow-ups scheduled. Set a reminder, call follow-up, or client milestone using the 3D Quick Add overlay."
            actionLabel="Quick Add Task (Q)"
            onAction={() => openQuickAdd('task')}
          />
        </div>
      )}

      {/* VIEW 1: LIST VIEW */}
      {viewMode === 'list' && filteredTasks.length > 0 && (
        <div className="card-3d bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Done</th>
                  <th className="py-3.5 px-4">Task Title</th>
                  <th className="py-3.5 px-4">Related To</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedTasks.map((t) => {
                  const isOverdue = t.dueDate < todayStr && t.status !== 'Completed' && t.status !== 'Cancelled';
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition ${
                        isOverdue ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={t.status === 'Completed'}
                          onChange={() =>
                            handleToggleTaskStatus(t.id, t.status === 'Completed' ? 'Pending' : 'Completed')
                          }
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span
                            className={`font-bold text-xs ${
                              t.status === 'Completed'
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {t.title}
                          </span>
                          {t.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          {t.relatedName || 'General'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{t.relatedType}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {t.assignedEmployeeName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[11px] font-semibold flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          {t.dueDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={priorityVariant(t.priority)} size="sm">
                          {t.priority}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={statusVariant(t.status)} size="sm">
                          {t.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setTaskToEdit(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredTasks.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* VIEW 2: CALENDAR SCHEDULE VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {calendarDays.map(([day, dayTasks]) => {
            const isToday = day === todayStr;
            const isPast = day < todayStr;

            return (
              <div
                key={day}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {day} {isToday && '(Today)'}
                    </span>
                    {isPast && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                        Past Deadline
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{dayTasks.length} Scheduled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Badge size="sm" variant={priorityVariant(t.priority)}>
                            {t.priority}
                          </Badge>
                          <Badge size="sm" variant={statusVariant(t.status)}>
                            {t.status}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{t.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{t.relatedName}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{t.assignedEmployeeName}</span>
                        <button
                          onClick={() =>
                            handleToggleTaskStatus(t.id, t.status === 'Completed' ? 'Pending' : 'Completed')
                          }
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          {t.status === 'Completed' ? 'Reopen' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={isAddOpen || !!taskToEdit}
        onClose={() => {
          setIsAddOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            handleDeleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
      />
    </div>
  );
};
