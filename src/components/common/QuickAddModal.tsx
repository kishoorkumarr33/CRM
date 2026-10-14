import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  Briefcase,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { Customer, Lead, Deal, Task, CustomerType, PriorityLevel, DealStage, TaskRelatedType } from '../../types/crm';

export type QuickAddTab = 'customer' | 'lead' | 'deal' | 'task';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: QuickAddTab;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'customer',
}) => {
  const {
    customers,
    leads,
    deals,
    tasks,
    employees,
    handleCreateCustomer,
    handleCreateLead,
    handleCreateDeal,
    handleCreateTask,
  } = useCRM();
  const { userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<QuickAddTab>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Customer form state
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custType, setCustType] = useState<CustomerType>('Enterprise');

  // Lead form state
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadValue, setLeadValue] = useState<number>(35000);
  const [leadPriority, setLeadPriority] = useState<PriorityLevel>('High');

  // Deal form state
  const [dealName, setDealName] = useState('');
  const [dealCustomerId, setDealCustomerId] = useState('');
  const [dealCustomCompany, setDealCustomCompany] = useState('');
  const [dealValue, setDealValue] = useState<number>(50000);
  const [dealStage, setDealStage] = useState<DealStage>('Discovery');
  const [dealCloseDate, setDealCloseDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskRelatedType, setTaskRelatedType] = useState<TaskRelatedType>('customer');
  const [taskRelatedId, setTaskRelatedId] = useState('');
  const [taskCustomName, setTaskCustomName] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('High');

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrors({});
      if (customers.length > 0 && !dealCustomerId) {
        setDealCustomerId(customers[0].id);
      }
      if (customers.length > 0 && !taskRelatedId) {
        setTaskRelatedId(customers[0].id);
      }
    }
  }, [isOpen, initialTab, customers]);

  // Global keyboard shortcuts (ESC to close, Tab switcher 1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      // Alt+1 to 4 or Ctrl+1 to 4 to switch quick tabs
      if ((e.altKey || e.metaKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const tabMap: Record<string, QuickAddTab> = {
          '1': 'customer',
          '2': 'lead',
          '3': 'deal',
          '4': 'task',
        };
        setActiveTab(tabMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultEmp = employees[0] || { id: 'EMP-101', name: 'Nkishoor Kumar' };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custCompany.trim()) {
      setErrors({ name: 'Contact name and company are required' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newCust: Customer = {
        id: `CUST-${1000 + customers.length + 1}`,
        name: custName.trim(),
        company: custCompany.trim(),
        email: custEmail.trim() || `contact_${Date.now()}@domain.com`,
        phone: custPhone.trim(),
        address: '',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        industry: 'Technology & SaaS',
        customerType: custType,
        source: 'Quick Add Portal',
        assignedEmployeeId: defaultEmp.id,
        assignedEmployeeName: defaultEmp.name,
        status: 'Active',
        notes: 'Added via 3D Quick Add overlay.',
        createdDate: new Date().toISOString().split('T')[0],
        lastContactDate: new Date().toISOString().split('T')[0],
      };
      await handleCreateCustomer(newCust);
      // Reset
      setCustName('');
      setCustCompany('');
      setCustEmail('');
      setCustPhone('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadCompany.trim()) {
      setErrors({ lead: 'Lead name and company are required' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newLead: Lead = {
        id: `LEAD-${2000 + leads.length + 1}`,
        leadName: leadName.trim(),
        company: leadCompany.trim(),
        email: leadEmail.trim() || `lead_${Date.now()}@company.com`,
        phone: '',
        source: 'Inbound Inquiry',
        interest: 'Enterprise Solution Suite',
        estimatedValue: Number(leadValue) || 25000,
        priority: leadPriority,
        status: 'New',
        assignedEmployeeId: defaultEmp.id,
        assignedEmployeeName: defaultEmp.name,
        followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        notes: 'Rapidly created via Quick Add.',
        createdDate: new Date().toISOString().split('T')[0],
      };
      await handleCreateLead(newLead);
      setLeadName('');
      setLeadCompany('');
      setLeadEmail('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName.trim()) {
      setErrors({ deal: 'Deal name is required' });
      return;
    }
    setIsSubmitting(true);
    try {
      let customerId = dealCustomerId;
      let customerName = 'General Account';

      if (customers.length > 0 && dealCustomerId) {
        const found = customers.find((c) => c.id === dealCustomerId);
        if (found) {
          customerId = found.id;
          customerName = found.company || found.name;
        }
      } else if (dealCustomCompany.trim()) {
        const newCustId = `CUST-${1000 + customers.length + 1}`;
        const autoCust: Customer = {
          id: newCustId,
          name: dealCustomCompany.trim(),
          company: dealCustomCompany.trim(),
          email: `contact_${Date.now()}@domain.com`,
          phone: '',
          address: '',
          city: 'New York',
          state: 'NY',
          country: 'United States',
          industry: 'Enterprise Technology',
          customerType: 'Enterprise',
          source: 'Quick Add Deal',
          assignedEmployeeId: defaultEmp.id,
          assignedEmployeeName: defaultEmp.name,
          status: 'Active',
          notes: 'Auto-created client account for Deal.',
          createdDate: new Date().toISOString().split('T')[0],
          lastContactDate: new Date().toISOString().split('T')[0],
        };
        await handleCreateCustomer(autoCust);
        customerId = newCustId;
        customerName = dealCustomCompany.trim();
      }

      const newDeal: Deal = {
        id: `DEAL-${3000 + deals.length + 1}`,
        dealName: dealName.trim(),
        customerId: customerId || 'CUST-GENERAL',
        customerName: customerName,
        value: Number(dealValue) || 10000,
        stage: dealStage,
        probability: dealStage === 'Won' ? 100 : dealStage === 'Negotiation' ? 80 : 30,
        expectedClosingDate: dealCloseDate,
        assignedEmployeeId: defaultEmp.id,
        assignedEmployeeName: defaultEmp.name,
        dealType: 'New Business',
        notes: 'Opportunity captured through Quick Add overlay.',
        createdDate: new Date().toISOString().split('T')[0],
      };
      await handleCreateDeal(newDeal);
      setDealName('');
      setDealCustomCompany('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setErrors({ task: 'Task title is required' });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedCust = customers.find((c) => c.id === taskRelatedId);
      const relatedName = selectedCust
        ? selectedCust.company || selectedCust.name
        : taskCustomName.trim() || 'Internal Workflow';

      const newTask: Task = {
        id: `TSK-${4000 + tasks.length + 1}`,
        title: taskTitle.trim(),
        description: 'Priority follow-up scheduled via Quick Add.',
        relatedType: taskRelatedType,
        relatedId: taskRelatedId || (selectedCust?.id || 'TASK-INTERNAL'),
        relatedName: relatedName,
        assignedEmployeeId: defaultEmp.id,
        assignedEmployeeName: defaultEmp.name,
        dueDate: taskDueDate,
        priority: taskPriority,
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
      };
      await handleCreateTask(newTask);
      setTaskTitle('');
      setTaskCustomName('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 3D Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 3D Modal Container */}
      <div
        className="relative w-full max-w-xl bg-[var(--bg-surface)] text-slate-100 rounded-2xl border-2 border-[var(--border-subtle)] z-10 overflow-hidden transform transition-all my-8 modal-3d"
        role="dialog"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                Quick Add Engine
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                  Instant
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Rapidly create customers, leads, deals, or follow-ups in ₹ INR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Segmented Entity Switcher */}
        <div className="p-3 bg-[var(--bg-app)] border-b border-[var(--border-subtle)]">
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'customer'
                  ? 'bg-[var(--bg-elevated)] text-indigo-400 shadow-md border border-indigo-500/40 transform -translate-y-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lead')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'lead'
                  ? 'bg-[var(--bg-elevated)] text-amber-400 shadow-md border border-amber-500/40 transform -translate-y-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Lead</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deal')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'deal'
                  ? 'bg-[var(--bg-elevated)] text-emerald-400 shadow-md border border-emerald-500/40 transform -translate-y-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('task')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'task'
                  ? 'bg-[var(--bg-elevated)] text-rose-400 shadow-md border border-rose-500/40 transform -translate-y-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Task</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          {/* TAB 1: QUICK CUSTOMER */}
          {activeTab === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Contact Full Name *
                  </label>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Robert Hastings"
                    autoFocus
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={custCompany}
                    onChange={(e) => setCustCompany(e.target.value)}
                    placeholder="e.g. Acme Innovations"
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="r.hastings@acme.com"
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tier / Segment
                  </label>
                  <select
                    value={custType}
                    onChange={(e) => setCustType(e.target.value as CustomerType)}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-semibold"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="SMB">SMB</option>
                    <option value="B2B">B2B</option>
                  </select>
                </div>
              </div>

              {errors.name && (
                <p className="text-xs text-rose-400 font-semibold">{errors.name}</p>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-[var(--border-subtle)]">
                <span className="text-[11px] text-slate-400">
                  Tip: Shortcut <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-amber-300">Alt+1-4</kbd> switches entity
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-3d-secondary px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-3d-amber px-5 py-2 text-xs"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Customer'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: QUICK LEAD */}
          {activeTab === 'lead' && (
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Prospect Name *
                  </label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Arthur Pendelton"
                    autoFocus
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="e.g. Vanguard Cyber"
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="apendelton@vanguard.com"
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Est. Value (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={leadValue}
                    onChange={(e) => setLeadValue(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-emerald-400 bg-[var(--bg-app)] border-[var(--border-subtle)] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={leadPriority}
                    onChange={(e) => setLeadPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-semibold"
                  >
                    <option value="Urgent">Urgent 🔥</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {errors.lead && (
                <p className="text-xs text-rose-400 font-semibold">{errors.lead}</p>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-[var(--border-subtle)]">
                <span className="text-[11px] text-slate-400 font-medium">Added to Kanban pipeline in ₹ INR</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-3d-secondary px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-3d-amber px-5 py-2 text-xs"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Lead'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: QUICK DEAL */}
          {activeTab === 'deal' && (
            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Opportunity / Deal Title *
                </label>
                <input
                  type="text"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder="e.g. Apex Cloud - Multi-Region Scale"
                  autoFocus
                  className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Customer Account
                  </label>
                  {customers.length > 0 ? (
                    <select
                      value={dealCustomerId}
                      onChange={(e) => setDealCustomerId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company || c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={dealCustomCompany}
                      onChange={(e) => setDealCustomCompany(e.target.value)}
                      placeholder="e.g. Acme Corp / Client Account"
                      className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Deal Value (₹ INR) *
                  </label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-emerald-400 bg-[var(--bg-app)] border-[var(--border-subtle)] font-extrabold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value as DealStage)}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-semibold"
                  >
                    <option value="Discovery">Discovery (20%)</option>
                    <option value="Qualification">Qualification (40%)</option>
                    <option value="Proposal">Proposal (60%)</option>
                    <option value="Negotiation">Negotiation (80%)</option>
                    <option value="Won">Closed Won (100%) 🎉</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={dealCloseDate}
                    onChange={(e) => setDealCloseDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-mono"
                  />
                </div>
              </div>

              {errors.deal && (
                <p className="text-xs text-rose-400 font-semibold">{errors.deal}</p>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-[var(--border-subtle)]">
                <span className="text-[11px] text-slate-400 font-medium">Pipeline revenue tracked in ₹ INR</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-3d-secondary px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-3d-emerald px-5 py-2 text-xs"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Deal'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: QUICK TASK */}
          {activeTab === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Task Title / Action Item *
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule discovery call with Chief Risk Officer"
                  autoFocus
                  className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Related Customer / Subject
                </label>
                {customers.length > 0 ? (
                  <select
                    value={taskRelatedId}
                    onChange={(e) => setTaskRelatedId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium"
                  >
                    <option value="">General Internal Task</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company || c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={taskCustomName}
                    onChange={(e) => setTaskCustomName(e.target.value)}
                    placeholder="e.g. Internal Pipeline or Client Account"
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-medium placeholder-slate-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs px-3.5 py-2.5 input-3d text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)] font-semibold"
                  >
                    <option value="Urgent">Urgent 🔥</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {errors.task && (
                <p className="text-xs text-rose-400 font-semibold">{errors.task}</p>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-[var(--border-subtle)]">
                <span className="text-[11px] text-slate-400 font-medium">Synced with notification alerts</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-3d-secondary px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-3d-amber px-5 py-2 text-xs"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
