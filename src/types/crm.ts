export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export type CustomerType = 'Enterprise' | 'Mid-Market' | 'SMB' | 'B2B' | 'B2C' | 'Individual';
export type CustomerStatus = 'Active' | 'Inactive' | 'Lead' | 'Churned';

export interface Customer {
  id: string; // e.g. CUST-1001
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  industry: string;
  customerType: CustomerType;
  source: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  status: CustomerStatus;
  notes: string;
  createdDate: string;
  lastContactDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Converted' | 'Lost';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Lead {
  id: string; // e.g. LEAD-2001
  leadName: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  interest: string;
  estimatedValue: number;
  priority: PriorityLevel;
  status: LeadStatus;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  followUpDate: string;
  notes: string;
  convertedCustomerId?: string;
  createdDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DealStage = 'Discovery' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  id: string; // e.g. DEAL-3001
  dealName: string;
  customerId: string;
  customerName: string;
  value: number;
  stage: DealStage;
  probability: number; // 0 to 100
  expectedClosingDate: string;
  actualClosingDate?: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  dealType: string;
  notes: string;
  createdDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string; // e.g. EMP-5001 or uid
  uid?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskRelatedType = 'customer' | 'lead' | 'deal' | 'general';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task {
  id: string; // e.g. TSK-4001
  title: string;
  description: string;
  relatedType: TaskRelatedType;
  relatedId?: string;
  relatedName?: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  dueDate: string;
  priority: PriorityLevel;
  status: TaskStatus;
  completionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InteractionType = 'Call' | 'Meeting' | 'Email' | 'Note';

export interface Interaction {
  id: string;
  customerId: string;
  customerName: string;
  type: InteractionType;
  summary: string;
  details: string;
  date: string;
  employeeId: string;
  employeeName: string;
  outcome?: string;
  createdAt?: string;
}

export interface CRMNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'task_due' | 'task_overdue' | 'lead_assigned' | 'deal_won' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  newLeads: number;
  activeDeals: number;
  totalWonRevenue: number;
  conversionRate: number; // percentage
  pendingTasks: number;
  overdueFollowUps: number;
  pipelineValue: number;
}
