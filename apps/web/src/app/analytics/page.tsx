'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingBag, MessageSquare } from 'lucide-react';

const api = {
  getMetrics: async (period: string) => {
    const res = await fetch(`/api/analytics/metrics?period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => api.getMetrics(period),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Conversion Rate',
      value: `${metrics?.leadConversion?.conversionRate || 0}%`,
      change: '+2.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: 'Total Revenue',
      value: `₹${metrics?.revenueMetrics?.totalRevenue?.toLocaleString() || 0}`,
      change: '+12.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Active Customers',
      value: metrics?.customerMetrics?.activeCustomers || 0,
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Bookings',
      value: metrics?.bookingMetrics?.totalBookings || 0,
      change: '-1.8%',
      trend: 'down',
      icon: ShoppingBag,
      color: 'orange',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your business performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
              <span className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Lead Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Leads</span>
              <span className="font-semibold">{metrics?.leadConversion?.totalLeads || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Converted</span>
              <span className="font-semibold text-green-600">{metrics?.leadConversion?.convertedLeads || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Conversion Time</span>
              <span className="font-semibold">{metrics?.leadConversion?.averageConversionTime || 0} days</span>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Invoice Value</span>
              <span className="font-semibold">₹{metrics?.revenueMetrics?.averageInvoiceValue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Success Rate</span>
              <span className="font-semibold text-green-600">{metrics?.revenueMetrics?.paymentSuccessRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Revenue</span>
              <span className="font-semibold text-orange-600">₹{metrics?.revenueMetrics?.pendingRevenue?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Customer Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Customers</span>
              <span className="font-semibold">{metrics?.customerMetrics?.totalCustomers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Repeat Customers</span>
              <span className="font-semibold text-blue-600">{metrics?.customerMetrics?.repeatCustomers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retention Rate</span>
              <span className="font-semibold">{metrics?.customerMetrics?.customerRetentionRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Message Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Communication Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Messages</span>
              <span className="font-semibold">{metrics?.messageMetrics?.totalMessages || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-semibold text-green-600">{metrics?.messageMetrics?.responseRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Response Time</span>
              <span className="font-semibold">{metrics?.messageMetrics?.averageResponseTime || 0} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
