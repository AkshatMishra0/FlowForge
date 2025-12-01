'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '@/lib/api';
import { Plus, Search, FileText, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const businessId = 'temp-business-id'; // Get from context/state

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', businessId, statusFilter],
    queryFn: () =>
      invoiceApi.getAll(businessId, {
        ...(statusFilter !== 'all' && { status: statusFilter }),
      }),
  });

  const filteredInvoices = invoices?.data?.filter((invoice: any) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statuses = [
    { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-800', icon: FileText },
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
    { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800', icon: Clock },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  ];

  const stats = {
    total: invoices?.data?.length || 0,
    totalRevenue: invoices?.data?.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0) || 0,
    paid: invoices?.data?.filter((i: any) => i.status === 'paid').length || 0,
    pending: invoices?.data?.filter((i: any) => i.status === 'sent').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Total Invoices</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Paid</div>
          <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  statusFilter === status.value
                    ? status.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="text-center py-12">Loading invoices...</div>
        ) : filteredInvoices?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No invoices found. Create your first invoice to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices?.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-blue-600">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">₹{invoice.totalAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.dueDate ? (
                        <div className="text-sm">
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statuses.find((s) => s.value === invoice.status)?.color ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
