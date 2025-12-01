'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:function_calls>
<invoke name="leadApi" />
import { Plus, Search, Filter, MoreVertical, Phone, Mail, Tag } from 'lucide-react';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const businessId = 'temp-business-id'; // Get from context/state

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', businessId, statusFilter],
    queryFn: () =>
      leadApi.getAll(businessId, {
        ...(statusFilter !== 'all' && { status: statusFilter }),
      }),
  });

  const filteredLeads = leads?.data?.filter((lead: any) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statuses = [
    { value: 'all', label: 'All Leads', color: 'bg-gray-100 text-gray-800' },
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
    { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
    { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads by name, phone, or email..."
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statuses.slice(1).map((status) => {
          const count = leads?.data?.filter((l: any) => l.status === status.value).length || 0;
          return (
            <div key={status.value} className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold mb-1">{count}</div>
              <div className="text-sm text-gray-600">{status.label}</div>
            </div>
          );
        })}
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="text-center py-12">Loading leads...</div>
        ) : filteredLeads?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No leads found. Create your first lead to get started.
          </div>
        ) : (
          <div className="divide-y">
            {filteredLeads?.map((lead: any) => (
              <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{lead.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statuses.find((s) => s.value === lead.status)?.color ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                      {lead.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.source && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span className="capitalize">{lead.source}</span>
                        </div>
                      )}
                    </div>

                    {lead.notes && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{lead.notes}</p>
                    )}
                  </div>

                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Lead Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add New Lead</h2>
            {/* Add form fields here */}
            <button
              onClick={() => setShowCreateModal(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
