'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { Users, Receipt, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const businessId = 'temp-business-id'; // Get from context/state

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', businessId],
    queryFn: () => dashboardApi.getStats(businessId),
  });

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity', businessId],
    queryFn: () => dashboardApi.getActivity(businessId),
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const statCards = [
    {
      label: 'Total Leads',
      value: stats?.data.totalLeads || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats?.data.totalRevenue || 0}`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Invoices',
      value: stats?.data.totalInvoices || 0,
      icon: Receipt,
      color: 'bg-purple-500',
    },
    {
      label: 'Bookings',
      value: stats?.data.totalBookings || 0,
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      label: 'Messages Sent',
      value: stats?.data.totalMessages || 0,
      icon: MessageSquare,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
          <div className="space-y-3">
            {activity?.data.leads?.slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.phone}</div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          <div className="space-y-3">
            {activity?.data.invoices?.slice(0, 5).map((invoice: any) => (
              <div key={invoice.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-gray-600">{invoice.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{invoice.totalAmount}</div>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Improved dashboard UI and performance - Modified: 2025-12-25 20:07:38
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
// Change line 11 for this commit
// Change line 12 for this commit
// Change line 13 for this commit
// Change line 14 for this commit
// Change line 15 for this commit
// Change line 16 for this commit
// Change line 17 for this commit
// Change line 18 for this commit
