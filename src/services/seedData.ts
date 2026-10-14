import { Customer, Lead, Deal, Task, Interaction, Employee, CRMNotification } from '../types/crm';

// Default state starts completely clean with 0 records per user request
export const initialEmployees: Employee[] = [
  {
    id: 'EMP-101',
    name: 'Nkishoor Kumar (Admin)',
    email: 'nkishoork@gmail.com',
    phone: '+1 (555) 234-5678',
    department: 'Executive Administration',
    jobTitle: 'CRM System Administrator',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    role: 'admin',
  },
];

export const initialCustomers: Customer[] = [];
export const initialLeads: Lead[] = [];
export const initialDeals: Deal[] = [];
export const initialTasks: Task[] = [];
export const initialInteractions: Interaction[] = [];
export const initialNotifications: CRMNotification[] = [];

// Optional sample catalog for demonstration if user explicitly clicks "Load Sample Records"
export const sampleDemoCustomers: Customer[] = [
  {
    id: 'CUST-1001',
    name: 'Robert Hastings',
    company: 'Apex Cloud Solutions',
    email: 'r.hastings@apexcloud.io',
    phone: '+1 (415) 890-1234',
    address: '450 Mission St, Suite 1200',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    industry: 'Cloud Infrastructure',
    customerType: 'Enterprise',
    source: 'Referral',
    assignedEmployeeId: 'EMP-101',
    assignedEmployeeName: 'Nkishoor Kumar',
    status: 'Active',
    notes: 'Key enterprise account. Evaluating licensing expansion in Q3.',
    createdDate: '2024-01-10',
    lastContactDate: '2024-03-28',
  },
  {
    id: 'CUST-1002',
    name: 'Amara Okafor',
    company: 'NovaBio Health Systems',
    email: 'amara.o@novabio.health',
    phone: '+1 (617) 440-9821',
    address: '100 Technology Square',
    city: 'Cambridge',
    state: 'MA',
    country: 'United States',
    industry: 'Healthcare & Biotech',
    customerType: 'Enterprise',
    source: 'Trade Show',
    assignedEmployeeId: 'EMP-101',
    assignedEmployeeName: 'Nkishoor Kumar',
    status: 'Active',
    notes: 'HIPAA compliance verified. Annual recurring support contract renewed.',
    createdDate: '2024-02-14',
    lastContactDate: '2024-04-02',
  },
];

export const sampleDemoLeads: Lead[] = [
  {
    id: 'LEAD-2001',
    leadName: 'Arthur Pendelton',
    company: 'Vanguard Cyber Defense',
    email: 'apendelton@vanguardcyber.com',
    phone: '+1 (202) 555-0177',
    source: 'Trade Show',
    interest: 'Enterprise Security Suite',
    estimatedValue: 85000,
    priority: 'Urgent',
    status: 'Proposal',
    assignedEmployeeId: 'EMP-101',
    assignedEmployeeName: 'Nkishoor Kumar',
    followUpDate: '2024-04-16',
    notes: 'Requested formal RFP presentation before board of directors.',
    createdDate: '2024-03-01',
  },
  {
    id: 'LEAD-2002',
    leadName: 'Maya Lin',
    company: 'Aether Renewable Energy',
    email: 'm.lin@aetherenergy.org',
    phone: '+1 (512) 555-0133',
    source: 'Website Inbound',
    interest: 'Telemetry Data Dashboard',
    estimatedValue: 48000,
    priority: 'High',
    status: 'Qualified',
    assignedEmployeeId: 'EMP-101',
    assignedEmployeeName: 'Nkishoor Kumar',
    followUpDate: '2024-04-18',
    notes: 'Budget approved for pilot rollout.',
    createdDate: '2024-03-15',
  },
];

export const sampleDemoDeals: Deal[] = [
  {
    id: 'DEAL-3001',
    dealName: 'Apex Cloud - Multi-Region Scale Expansion',
    customerId: 'CUST-1001',
    customerName: 'Apex Cloud Solutions',
    value: 145000,
    stage: 'Won',
    probability: 100,
    expectedClosingDate: '2024-03-25',
    actualClosingDate: '2024-03-24',
    assignedEmployeeId: 'EMP-101',
    assignedEmployeeName: 'Nkishoor Kumar',
    dealType: 'Expansion',
    notes: 'Contract executed for 3-year term.',
    createdDate: '2024-01-15',
  },
  {
    id: 'DEAL-3002',
    dealName: 'NovaBio - Clinical Data Pipeline Tier 1',
    customerId: 'CUST-1002',
    customerName: 'NovaBio Health Systems',
    value: 98000,
    stage: 'Proposal',
    probability: 60,
    expectedClosingDate: '2024-05-15',
    assignedEmployeeId: 'EMP-101',
    assignedEmployeeName: 'Nkishoor Kumar',
    dealType: 'New Business',
    notes: 'Security audit cleared with clean sheet.',
    createdDate: '2024-02-18',
  },
];

export const sampleDemoTasks: Task[] = [
  {
    id: 'TSK-4001',
    title: 'Conduct Q2 Executive Quarterly Business Review (QBR)',
    description: 'Prepare executive deck on SLA metrics and resource utilization.',
    relatedType: 'customer',
    relatedId: 'CUST-1001',
    relatedName: 'Apex Cloud Solutions',
    assignedEmployeeId: 'EMP-101',
    assignedEmployeeName: 'Nkishoor Kumar',
    dueDate: '2024-04-18',
    priority: 'High',
    status: 'In Progress',
  },
];
