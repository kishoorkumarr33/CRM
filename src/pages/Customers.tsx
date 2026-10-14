import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  ArrowUpDown,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Customer, CustomerType, CustomerStatus } from '../types/crm';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { CustomerFormModal } from '../components/forms/CustomerFormModal';
import { exportToCSV, parseCSV } from '../utils/csv';
import { EmptyState } from '../components/common/EmptyState';

interface CustomersProps {
  onSelectCustomer: (customerId: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ onSelectCustomer }) => {
  const { customers, employees, handleDeleteCustomer, handleCreateCustomer, openQuickAdd } = useCRM();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'company' | 'createdDate' | 'lastContactDate'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.company.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.id.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesType = typeFilter === 'all' || c.customerType === typeFilter;
        const matchesAssigned = assignedFilter === 'all' || c.assignedEmployeeId === assignedFilter;

        return matchesSearch && matchesStatus && matchesType && matchesAssigned;
      })
      .sort((a, b) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        if (sortOrder === 'asc') {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      });
  }, [customers, search, statusFilter, typeFilter, assignedFilter, sortField, sortOrder]);

  // Paginated records
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    exportToCSV<Customer>('customers_directory', filteredCustomers, [
      { key: 'id', label: 'Customer ID' },
      { key: 'name', label: 'Contact Name' },
      { key: 'company', label: 'Company' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'customerType', label: 'Type' },
      { key: 'industry', label: 'Industry' },
      { key: 'status', label: 'Status' },
      { key: 'assignedEmployeeName', label: 'Assigned Staff' },
      { key: 'createdDate', label: 'Created Date' },
      { key: 'lastContactDate', label: 'Last Contact' },
    ]);
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      try {
        const parsed = parseCSV(text);
        let importedCount = 0;
        for (const row of parsed) {
          if (!row['Contact Name'] && !row['name'] && !row['Company'] && !row['company']) continue;
          const nextId = `CUST-${1000 + customers.length + importedCount + 1}`;
          const newCust: Customer = {
            id: row['Customer ID'] || row['id'] || nextId,
            name: row['Contact Name'] || row['name'] || 'New Contact',
            company: row['Company'] || row['company'] || 'Self-Employed',
            email: row['Email'] || row['email'] || `client_${Date.now()}@domain.com`,
            phone: row['Phone'] || row['phone'] || '',
            address: row['Address'] || row['address'] || '',
            city: row['City'] || row['city'] || '',
            state: row['State'] || row['state'] || '',
            country: row['Country'] || row['country'] || 'United States',
            industry: row['Industry'] || row['industry'] || 'Technology',
            customerType: (row['Type'] || row['customerType'] || 'Mid-Market') as CustomerType,
            source: row['Source'] || row['source'] || 'CSV Import',
            assignedEmployeeId: employees[0]?.id || 'EMP-101',
            assignedEmployeeName: employees[0]?.name || 'Nkishoor Kumar',
            status: (row['Status'] || row['status'] || 'Active') as CustomerStatus,
            notes: row['Notes'] || row['notes'] || 'Imported via CSV batch upload',
            createdDate: new Date().toISOString().split('T')[0],
            lastContactDate: new Date().toISOString().split('T')[0],
          };
          await handleCreateCustomer(newCust);
          importedCount++;
        }
      } catch (err) {
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const statusVariant = (st: CustomerStatus) => {
    switch (st) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'secondary';
      case 'Lead':
        return 'warning';
      case 'Churned':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Customers Directory
            </h1>
            <Badge variant="primary" size="md">
              {filteredCustomers.length} Accounts
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage enterprise client accounts, communication history, and assigned relationships.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-3d-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import CSV
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-3d-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => openQuickAdd('customer')}
            className="btn-3d-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
            title="Quick Add Overlay"
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

      {/* Filter and Search Bar */}
      <div className="card-3d p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, company, email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Lead">Lead</option>
              <option value="Churned">Churned</option>
            </select>
          </div>

          {/* Segment/Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Segments</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
              <option value="Individual">Individual</option>
            </select>
          </div>

          {/* Assigned Staff filter */}
          <div>
            <select
              value={assignedFilter}
              onChange={(e) => {
                setAssignedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Account Managers</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="card-3d bg-white overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers match your criteria"
            description="Your customer pipeline is clean. Quickly add your first client account using the 3D Quick Add overlay."
            actionLabel="Quick Add Customer (Q)"
            onAction={() => openQuickAdd('customer')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-indigo-600 transition"
                    >
                      Customer Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      onClick={() => handleSort('company')}
                      className="flex items-center gap-1 hover:text-indigo-600 transition"
                    >
                      Company & Industry
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Segment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Account Manager</th>
                  <th className="py-3.5 px-4">
                    <button
                      onClick={() => handleSort('lastContactDate')}
                      className="flex items-center gap-1 hover:text-indigo-600 transition"
                    >
                      Last Contact
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginatedCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => onSelectCustomer(cust.id)}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition flex items-center gap-1"
                          >
                            {cust.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">{cust.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {cust.company}
                        </span>
                        <span className="text-[10px] text-slate-400">{cust.industry}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {cust.email}
                        </span>
                        {cust.phone && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {cust.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="primary" size="sm">
                        {cust.customerType}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={statusVariant(cust.status)} size="sm">
                        {cust.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {cust.assignedEmployeeName || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {cust.lastContactDate || cust.createdDate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectCustomer(cust.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View 360 Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCustomerToEdit(cust)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(cust)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCustomers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isAddOpen || !!customerToEdit}
        onClose={() => {
          setIsAddOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={() => {
          if (customerToDelete) {
            handleDeleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }
        }}
        title="Delete Customer Account"
        message={`Are you sure you want to permanently delete "${customerToDelete?.name}" (${customerToDelete?.company})? All associated timeline logs and deals will be decoupled.`}
        confirmLabel="Confirm Delete"
      />
    </div>
  );
};
