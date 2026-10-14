import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Customer,
  Lead,
  Deal,
  Task,
  Interaction,
  Employee,
  CRMNotification,
  DashboardMetrics,
} from '../types/crm';
import {
  subscribeCustomers,
  subscribeLeads,
  subscribeDeals,
  subscribeTasks,
  subscribeInteractions,
  subscribeEmployees,
  subscribeNotifications,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createLead,
  updateLead,
  deleteLead,
  createDeal,
  updateDeal,
  deleteDeal,
  createTask,
  updateTask,
  deleteTask,
  createInteraction,
  deleteInteraction,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  markNotificationAsRead,
  createNotification,
  seedInitialData,
  clearAllCRMCollections,
} from '../services/firestoreService';
import { QuickAddTab } from '../components/common/QuickAddModal';
import { formatINR } from '../utils/formatCurrency';
import {
  initialCustomers,
  initialLeads,
  initialDeals,
  initialTasks,
  initialInteractions,
  initialEmployees,
  initialNotifications,
  sampleDemoCustomers,
  sampleDemoLeads,
  sampleDemoDeals,
  sampleDemoTasks,
} from '../services/seedData';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface CRMContextType {
  customers: Customer[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  interactions: Interaction[];
  employees: Employee[];
  notifications: CRMNotification[];
  loading: boolean;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Quick Add Overlay
  isQuickAddOpen: boolean;
  quickAddTab: QuickAddTab;
  openQuickAdd: (tab?: QuickAddTab) => void;
  closeQuickAdd: () => void;

  // Customers
  handleCreateCustomer: (customer: Customer) => Promise<void>;
  handleUpdateCustomer: (customer: Customer) => Promise<void>;
  handleDeleteCustomer: (id: string) => Promise<void>;

  // Leads
  handleCreateLead: (lead: Lead) => Promise<void>;
  handleUpdateLead: (lead: Lead) => Promise<void>;
  handleDeleteLead: (id: string) => Promise<void>;
  handleConvertLead: (lead: Lead, existingCustomerId?: string) => Promise<Customer>;

  // Deals
  handleCreateDeal: (deal: Deal) => Promise<void>;
  handleUpdateDeal: (deal: Deal) => Promise<void>;
  handleDeleteDeal: (id: string) => Promise<void>;
  handleUpdateDealStage: (dealId: string, stage: Deal['stage']) => Promise<void>;

  // Tasks
  handleCreateTask: (task: Task) => Promise<void>;
  handleUpdateTask: (task: Task) => Promise<void>;
  handleDeleteTask: (id: string) => Promise<void>;
  handleToggleTaskStatus: (taskId: string, newStatus: Task['status']) => Promise<void>;

  // Interactions
  handleCreateInteraction: (interaction: Interaction) => Promise<void>;
  handleDeleteInteraction: (id: string) => Promise<void>;

  // Employees
  handleCreateEmployee: (employee: Employee) => Promise<void>;
  handleUpdateEmployee: (employee: Employee) => Promise<void>;
  handleDeleteEmployee: (id: string) => Promise<void>;

  // Notifications
  handleMarkNotificationRead: (id: string) => Promise<void>;

  // Reset & Clear & Sample
  handleResetDemoData: () => Promise<void>;
  handleClearAllData: () => Promise<void>;
  handleLoadSampleData: () => Promise<void>;
  metrics: DashboardMetrics;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [notifications, setNotifications] = useState<CRMNotification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Quick Add Overlay state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<QuickAddTab>('customer');

  const openQuickAdd = (tab: QuickAddTab = 'customer') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
  };

  // Global Quick Add hotkey 'q' or 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if (!isInput && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Ensure default data is cleaned per user request on initial start (only when authenticated)
  useEffect(() => {
    if (!user) return;
    const hasCleaned = localStorage.getItem(`apex_crm_cleaned_slate_${user.uid}`);
    if (!hasCleaned) {
      clearAllCRMCollections().then(() => {
        setCustomers([]);
        setLeads([]);
        setDeals([]);
        setTasks([]);
        setInteractions([]);
        setNotifications([]);
        localStorage.setItem(`apex_crm_cleaned_slate_${user.uid}`, 'true');
      }).catch((e) => console.warn('Clean slate err:', e));
    }
  }, [user]);

  // Wire realtime subscriptions to Firestore only when user is authenticated
  useEffect(() => {
    if (!user) {
      return;
    }
    let unsubs: (() => void)[] = [];

    try {
      const u1 = subscribeCustomers((data) => {
        setCustomers(data);
      });
      const u2 = subscribeLeads((data) => {
        setLeads(data);
      });
      const u3 = subscribeDeals((data) => {
        setDeals(data);
      });
      const u4 = subscribeTasks((data) => {
        setTasks(data);
      });
      const u5 = subscribeInteractions((data) => {
        setInteractions(data);
      });
      const u6 = subscribeEmployees((data) => {
        if (data.length > 0) setEmployees(data);
      });
      const u7 = subscribeNotifications((data) => {
        setNotifications(data);
      });
      unsubs = [u1, u2, u3, u4, u5, u6, u7];
    } catch (err) {
      console.warn('Realtime sync in local mirror mode:', err);
    }

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [user]);

  // Compute dashboard metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const totalCustomers = customers.filter((c) => c.status === 'Active').length;
    const newLeads = leads.filter((l) => l.status === 'New' || l.status === 'Contacted').length;

    // Active deals: not Won and not Lost
    const activeDealsList = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
    const activeDeals = activeDealsList.length;
    const pipelineValue = activeDealsList.reduce((acc, d) => acc + (d.value || 0), 0);

    // Won deals revenue
    const wonDeals = deals.filter((d) => d.stage === 'Won');
    const totalWonRevenue = wonDeals.reduce((acc, d) => acc + (d.value || 0), 0);

    // Lead conversion rate: converted / total leads * 100
    const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
    const totalLeadsCount = leads.length;
    const conversionRate = totalLeadsCount > 0 ? Math.round((convertedLeads / totalLeadsCount) * 100) : 0;

    // Pending tasks
    const pendingTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length;

    // Overdue tasks: due date before today and not completed
    const today = new Date().toISOString().split('T')[0];
    const overdueFollowUps = tasks.filter(
      (t) => t.dueDate < today && t.status !== 'Completed' && t.status !== 'Cancelled'
    ).length;

    return {
      totalCustomers,
      newLeads,
      activeDeals,
      totalWonRevenue,
      conversionRate,
      pendingTasks,
      overdueFollowUps,
      pipelineValue,
    };
  }, [customers, leads, deals, tasks]);

  // Customer handlers
  const handleCreateCustomer = async (cust: Customer) => {
    setCustomers((prev) => [cust, ...prev]);
    try {
      await createCustomer(cust);
      addToast(`Customer "${cust.name}" created successfully`);
    } catch (err) {
      console.warn('Saved locally:', err);
      addToast(`Customer "${cust.name}" added`, 'success');
    }
  };

  const handleUpdateCustomer = async (cust: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));
    try {
      await updateCustomer(cust);
      addToast(`Customer "${cust.name}" updated`);
    } catch (err) {
      console.warn('Updated locally:', err);
      addToast(`Customer "${cust.name}" updated`, 'success');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCustomer(id);
      addToast(`Customer "${cust?.name || id}" deleted`, 'info');
    } catch (err) {
      console.warn('Deleted locally:', err);
      addToast(`Customer deleted`, 'info');
    }
  };

  // Lead handlers
  const handleCreateLead = async (lead: Lead) => {
    setLeads((prev) => [lead, ...prev]);
    try {
      await createLead(lead);
      addToast(`Lead "${lead.leadName}" created`);
    } catch (err) {
      addToast(`Lead "${lead.leadName}" created`, 'success');
    }
  };

  const handleUpdateLead = async (lead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
    try {
      await updateLead(lead);
      addToast(`Lead "${lead.leadName}" updated`);
    } catch (err) {
      addToast(`Lead "${lead.leadName}" updated`, 'success');
    }
  };

  const handleDeleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteLead(id);
      addToast('Lead deleted', 'info');
    } catch (err) {
      addToast('Lead deleted', 'info');
    }
  };

  // Convert lead to customer without duplicates
  const handleConvertLead = async (lead: Lead, existingCustomerId?: string): Promise<Customer> => {
    let customer: Customer;

    if (existingCustomerId) {
      const found = customers.find((c) => c.id === existingCustomerId);
      if (!found) throw new Error('Existing customer not found');
      customer = found;
    } else {
      // Check if email already matches a customer
      const existing = customers.find(
        (c) => c.email.toLowerCase() === lead.email.toLowerCase() || (lead.company && c.company.toLowerCase() === lead.company.toLowerCase())
      );

      if (existing) {
        customer = existing;
      } else {
        const newCustId = `CUST-${1000 + customers.length + 1}`;
        customer = {
          id: newCustId,
          name: lead.leadName,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          address: '',
          city: '',
          state: '',
          country: 'United States',
          industry: lead.interest || 'General Business',
          customerType: 'Mid-Market',
          source: lead.source,
          assignedEmployeeId: lead.assignedEmployeeId,
          assignedEmployeeName: lead.assignedEmployeeName,
          status: 'Active',
          notes: `Converted from lead (${lead.id}). Initial notes: ${lead.notes}`,
          createdDate: new Date().toISOString().split('T')[0],
          lastContactDate: new Date().toISOString().split('T')[0],
        };
        await handleCreateCustomer(customer);
      }
    }

    // Mark lead as Converted
    const updatedLead: Lead = {
      ...lead,
      status: 'Converted',
      convertedCustomerId: customer.id,
      notes: `${lead.notes}\n[System]: Converted to customer ${customer.name} (${customer.id}) on ${new Date().toLocaleDateString()}`,
    };
    await handleUpdateLead(updatedLead);

    // Create a conversion interaction note
    const notifInteraction: Interaction = {
      id: `INT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      customerId: customer.id,
      customerName: customer.name,
      type: 'Note',
      summary: 'Lead Converted to Customer',
      details: `Lead ${lead.leadName} (${lead.company}) was successfully qualified and converted into account ${customer.company || customer.name}.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      employeeId: userProfile?.uid || lead.assignedEmployeeId,
      employeeName: userProfile?.displayName || lead.assignedEmployeeName,
      outcome: 'Converted',
    };
    await handleCreateInteraction(notifInteraction);

    addToast(`Successfully converted lead "${lead.leadName}" to customer "${customer.name}"!`);
    return customer;
  };

  // Deal handlers
  const handleCreateDeal = async (deal: Deal) => {
    setDeals((prev) => [deal, ...prev]);
    try {
      await createDeal(deal);
      addToast(`Deal "${deal.dealName}" created (${formatINR(deal.value)})`);
    } catch (err) {
      addToast(`Deal created`, 'success');
    }
  };

  const handleUpdateDeal = async (deal: Deal) => {
    setDeals((prev) => prev.map((d) => (d.id === deal.id ? deal : d)));
    try {
      await updateDeal(deal);
      addToast(`Deal "${deal.dealName}" updated`);
    } catch (err) {
      addToast(`Deal updated`, 'success');
    }
  };

  const handleDeleteDeal = async (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDeal(id);
      addToast('Deal removed', 'info');
    } catch (err) {
      addToast('Deal removed', 'info');
    }
  };

  const handleUpdateDealStage = async (dealId: string, stage: Deal['stage']) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;
    const probability = stage === 'Won' ? 100 : stage === 'Lost' ? 0 : stage === 'Negotiation' ? 80 : stage === 'Proposal' ? 60 : stage === 'Qualification' ? 40 : 20;
    const updated: Deal = {
      ...deal,
      stage,
      probability,
      actualClosingDate: stage === 'Won' || stage === 'Lost' ? new Date().toISOString().split('T')[0] : deal.actualClosingDate,
    };
    await handleUpdateDeal(updated);
    if (stage === 'Won') {
      addToast(`🎉 Deal WON: ${deal.dealName} (${formatINR(deal.value)})!`);
    }
  };

  // Task handlers
  const handleCreateTask = async (task: Task) => {
    setTasks((prev) => [task, ...prev]);
    try {
      await createTask(task);
      addToast(`Task "${task.title}" added`);
    } catch (err) {
      addToast(`Task added`, 'success');
    }
  };

  const handleUpdateTask = async (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    try {
      await updateTask(task);
      addToast(`Task "${task.title}" updated`);
    } catch (err) {
      addToast(`Task updated`, 'success');
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
      addToast('Task deleted', 'info');
    } catch (err) {
      addToast('Task deleted', 'info');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated: Task = {
      ...task,
      status: newStatus,
      completionDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
    };
    await handleUpdateTask(updated);
  };

  // Interaction handlers
  const handleCreateInteraction = async (interaction: Interaction) => {
    setInteractions((prev) => [interaction, ...prev]);
    try {
      await createInteraction(interaction);
      addToast(`Logged ${interaction.type.toLowerCase()} with ${interaction.customerName}`);
    } catch (err) {
      addToast(`Activity logged`, 'success');
    }
  };

  const handleDeleteInteraction = async (id: string) => {
    setInteractions((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteInteraction(id);
      addToast('Interaction log deleted', 'info');
    } catch (err) {
      addToast('Interaction deleted', 'info');
    }
  };

  // Employee handlers
  const handleCreateEmployee = async (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
    try {
      await createEmployee(employee);
      addToast(`Employee "${employee.name}" created`);
    } catch (err) {
      addToast(`Employee added`, 'success');
    }
  };

  const handleUpdateEmployee = async (employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? employee : e)));
    try {
      await updateEmployee(employee);
      addToast(`Employee "${employee.name}" updated`);
    } catch (err) {
      addToast(`Employee updated`, 'success');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteEmployee(id);
      addToast('Employee deactivated and deleted', 'info');
    } catch (err) {
      addToast('Employee deleted', 'info');
    }
  };

  // Notification handlers
  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      // local updated
    }
  };

  const handleResetDemoData = async () => {
    setLoading(true);
    setCustomers(initialCustomers);
    setLeads(initialLeads);
    setDeals(initialDeals);
    setTasks(initialTasks);
    setInteractions(initialInteractions);
    setEmployees(initialEmployees);
    setNotifications(initialNotifications);
    try {
      await seedInitialData(true);
      addToast('CRM database successfully reset to clean demonstration dataset!');
    } catch (err) {
      addToast('Reset to demo baseline', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    setLoading(true);
    try {
      await clearAllCRMCollections();
      setCustomers([]);
      setLeads([]);
      setDeals([]);
      setTasks([]);
      setInteractions([]);
      setNotifications([]);
      addToast('All default data cleared from database. Clean slate active.', 'info');
    } catch (err) {
      console.warn('Error clearing:', err);
      addToast('Cleared local data view', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    for (const c of sampleDemoCustomers) {
      await handleCreateCustomer(c);
    }
    for (const l of sampleDemoLeads) {
      await handleCreateLead(l);
    }
    for (const d of sampleDemoDeals) {
      await handleCreateDeal(d);
    }
    for (const t of sampleDemoTasks) {
      await handleCreateTask(t);
    }
    addToast('Sample demonstration records loaded successfully!', 'success');
    setLoading(false);
  };

  return (
    <CRMContext.Provider
      value={{
        customers,
        leads,
        deals,
        tasks,
        interactions,
        employees,
        notifications,
        loading,
        toasts,
        addToast,
        removeToast,
        isQuickAddOpen,
        quickAddTab,
        openQuickAdd,
        closeQuickAdd,
        handleCreateCustomer,
        handleUpdateCustomer,
        handleDeleteCustomer,
        handleCreateLead,
        handleUpdateLead,
        handleDeleteLead,
        handleConvertLead,
        handleCreateDeal,
        handleUpdateDeal,
        handleDeleteDeal,
        handleUpdateDealStage,
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleToggleTaskStatus,
        handleCreateInteraction,
        handleDeleteInteraction,
        handleCreateEmployee,
        handleUpdateEmployee,
        handleDeleteEmployee,
        handleMarkNotificationRead,
        handleResetDemoData,
        handleClearAllData,
        handleLoadSampleData,
        metrics,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
