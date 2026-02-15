import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#D50000', '#1A1A1A', '#C0C0C0', '#FF6B6B', '#4ECDC4', '#FFE66D'];

export default function AdminReporting() {
  const [dateRange, setDateRange] = useState('month');

  const { data: rfqs = [], isLoading: rfqsLoading } = useQuery({
    queryKey: ['admin-report-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 500),
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['admin-report-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 500),
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['admin-report-logs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200),
  });

  // Calculate metrics
  const totalRevenue = rfqs
    .filter(r => r.final_status === 'won')
    .reduce((sum, r) => sum + (r.final_value || 0), 0);

  const averageQuoteTime = rfqs.length > 0
    ? rfqs.reduce((sum, r) => sum + 1, 0) / rfqs.length
    : 0;

  const conversionRate = rfqs.length > 0
    ? ((rfqs.filter(r => r.final_status === 'won').length / rfqs.length) * 100).toFixed(1)
    : 0;

  // RFQ trends by mode
  const rfqByMode = {};
  rfqs.forEach(r => {
    rfqByMode[r.mode] = (rfqByMode[r.mode] || 0) + 1;
  });
  const rfqModeData = Object.entries(rfqByMode).map(([mode, count]) => ({ name: mode?.toUpperCase(), value: count }));

  // Shipment status distribution
  const shipmentStatus = {};
  shipments.forEach(s => {
    shipmentStatus[s.status] = (shipmentStatus[s.status] || 0) + 1;
  });
  const statusData = Object.entries(shipmentStatus).map(([status, count]) => ({ name: status.replace(/_/g, ' '), value: count }));

  // Daily activity trend
  const dailyActivity = {};
  activityLogs.forEach(log => {
    const date = new Date(log.created_date).toLocaleDateString();
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
  });
  const activityTrend = Object.entries(dailyActivity).slice(-7).map(([date, count]) => ({ date, count }));

  const isLoading = rfqsLoading || shipmentsLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Business Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Comprehensive performance and operations reporting</p>
        </div>
        <Button className="bg-[#D50000] hover:bg-[#B00000]">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total RFQs</p>
                <p className="text-3xl font-bold text-[#1A1A1A] mt-2">{rfqs.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Shipments</p>
                <p className="text-3xl font-bold text-[#1A1A1A] mt-2">{shipments.filter(s => s.status !== 'delivered').length}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Revenue (Won)</p>
                <p className="text-3xl font-bold text-[#1A1A1A] mt-2">${(totalRevenue / 1000).toFixed(1)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold text-[#1A1A1A] mt-2">{conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* RFQ by Mode */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">RFQs by Transport Mode</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={rfqModeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {rfqModeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Shipment Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Shipment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#D50000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Trend */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
          <h3 className="font-bold text-[#1A1A1A] mb-4">System Activity Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#D50000" name="Activities" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}