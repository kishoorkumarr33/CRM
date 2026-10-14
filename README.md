# ApexCRM - Customer & Sales Management System

A high-performance Customer Relationship Management (CRM) web application designed for small-to-medium enterprises and college project demonstrations. It provides pipeline tracking, customer 360 profile management, sales analytics, and role-based access control.

---

## 🚀 Key Features & Modules

### 1. Dashboard
- **Real-Time KPIs**: Total Customers, Won Revenue ($), Active Pipeline Volume ($), Lead Conversion Rate (%), Pending Tasks, and Overdue Follow-ups.
- **Dynamic Charts (Recharts)**:
  - Monthly Sales & Won Revenue trajectory
  - Lead Acquisition Source distribution (donut chart)
  - Pipeline Stage Distribution (bar chart)
  - Sales Representative Performance comparison
- **Activity Streams**: Overdue follow-up alert banners, upcoming task tracker, and recent customer interactions.

### 2. Customers Module
- Full CRUD operations with instant search, sorting, multi-criteria filtering, and pagination.
- **Customer 360 View**: Contact info, company details, revenue metrics, communication history timeline, deals, and tasks.
- **CSV Data Exchange**: Single-click CSV export and batch CSV import parser.

### 3. Leads & Qualification Pipeline
- **Kanban Board & List View**: Visual workflow across stages: `New` → `Contacted` → `Qualified` → `Proposal` → `Converted` or `Lost`.
- **Duplicate-Safe Lead Conversion**: Converts qualified prospects into active Customer Accounts while linking records and preventing duplicate entries.
- Lead valuation ($) and priority indicators (`Urgent`, `High`, `Medium`, `Low`).

### 4. Sales & Deals Pipeline
- Revenue calculation strictly isolated to eligible **Closed-Won** deals.
- Active pipeline value tracked separately for ongoing negotiation.
- Win probabilities (0% to 100%), expected closing dates, and quick "Mark Won" / "Mark Lost" buttons.

### 5. Task & Follow-up Management
- Follow-up tracker with calendar scheduling and list views.
- Automatic **Overdue Detection** with high-visibility warnings.
- Relationship mapping to Customers, Leads, Deals, or internal tasks.

### 6. Interaction Timeline
- Logs communication channels: **Phone Calls**, **Meetings**, **Emails**, and **Internal Notes**.
- Records dates, assigned staff members, conversation summaries, and outcomes.

### 7. Interactive Reports & Analytics
- Multi-dimensional reporting:
  - Sales & Revenue Win/Loss Analysis
  - Lead Acquisition & Channel Conversion Efficacy
  - Employee Quota & Attainment
  - Task Execution & SLA Audit
- Date range filtering and CSV export for every report.

### 8. Role-Based Access Control (RBAC)
- **Administrator**: Complete control over system configuration, employee directory, roles, and database reset.
- **Manager**: Team oversight, territory management, and sales assignment.
- **Employee**: Manages assigned customers, leads, opportunities, and follow-ups.
- **Role Simulator**: Built-in test switch allowing reviewers and evaluators to test different permission levels with a single click.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Analytics & Visualizations**: Recharts
- **Database & Auth**: Cloud Firestore (Enterprise), Firebase Authentication
- **Security Rules**: Zero-trust Firestore Security Rules with ABAC validation

---

## 🗄️ Database Schema & Collections

| Collection | Description | Document Key Fields |
|------------|-------------|---------------------|
| `users` | User profiles and roles | `uid`, `email`, `role`, `displayName`, `department` |
| `admins` | Verified admin index | Document ID is admin UID |
| `customers` | Client accounts | `id`, `name`, `company`, `email`, `status`, `assignedEmployeeId` |
| `leads` | Inbound prospects | `id`, `leadName`, `estimatedValue`, `priority`, `status` |
| `deals` | Sales opportunities | `id`, `dealName`, `value`, `stage`, `probability`, `customerId` |
| `tasks` | Follow-ups | `id`, `title`, `dueDate`, `priority`, `status`, `assignedEmployeeId` |
| `interactions` | Activity logs | `id`, `customerId`, `type`, `summary`, `date`, `employeeId` |
| `notifications` | System alerts | `id`, `title`, `message`, `type`, `read`, `createdAt` |

---

## 🧪 Testing Verification Guide

1. **Sign In**: Use Google One-Click Login or Quick Role Access buttons.
2. **Create Employee**: Navigate to `Employees` -> click `Add Employee`.
3. **Add Customer**: Navigate to `Customers` -> click `Add Customer` or use `Import CSV`.
4. **Lead Pipeline**: Move a lead card from `New` to `Qualified` -> click `Convert` to promote to a Customer.
5. **Create & Win Deal**: Create a deal -> move stage to `Won` -> observe revenue KPI update.
6. **Complete Task**: Click the checkbox on any overdue task -> observe metric counters decrement.
7. **Export Data**: Visit `Reports` or `Customers` -> click `Export CSV` to download spreadsheets.
