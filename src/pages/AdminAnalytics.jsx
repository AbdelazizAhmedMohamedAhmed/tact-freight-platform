import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from '../components/portal/StatsCard';
import { DollarSign, TrendingUp, Package, FileText, Download, Calendar, Users, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#D50000', '#1A1A1A', '#C0C0C0', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: rfqs = [], isLoading: rfqL } = useQuery({
    queryKey: ['analytics-rfqs'], queryFn: () => base44.entities.RFQ.list('-created_date', 1000),
  });
  const { data: shipments = [], isLoading: shipL } = useQuery({
    queryKey: ['analytics-shipments'], queryFn: () => base44.entities.Shipment.list('-created_date', 1000),
  });
  const { data: users = [], isLoading: userL } = useQuery({
    queryKey: ['analytics-users'], queryFn: () => base44.entities.User.list('-created_date', 1000),
  });
  const { data: activities = [], isLoading: actL } = useQuery({
    queryKey: ['analytics-activities'], queryFn: () => base44.entities.ActivityLog.list('-created_date', 1000),
  });

  const isLoading = rfqL || shipL || userL || actL;

  // Filter data by date range
  const { filteredRFQs, filteredShipments, filteredActivities, dateFilter } = useMemo(() => {
    let start, end;
    
    if (dateRange === 'custom' && startDate && endDate) {
      start = startOfDay(parseISO(startDate));
      end = endOfDay(parseISO(endDate));
    } else {
      const days = parseInt(dateRange);
      end = endOfDay(new Date());
      start = startOfDay(subDays(end, days));
    }

    const filter = (item) => {
      if (!item.created_date) return false;
      const date = parseISO(item.created_date);
      return isWithinInterval(date, { start, end });
    };

    return {
      filteredRFQs: rfqs.filter(filter),
      filteredShipments: shipments.filter(filter),
      filteredActivities: activities.filter(filter),
      dateFilter: { start, end }
    };
  }, [rfqs, shipments, activities, dateRange, startDate, endDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    // RFQ metrics
    const totalRFQs = filteredRFQs.length;
    const pendingRFQs = filteredRFQs.filter(r => ['submitted', 'sales_review', 'pricing_review'].includes(r.status)).length;
    const acceptedRFQs = filteredRFQs.filter(r => r.status === 'accepted').length;
    const rejectedRFQs = filteredRFQs.filter(r => r.status === 'rejected').length;
    const conversionRate = totalRFQs > 0 ? ((acceptedRFQs / totalRFQs) * 100).toFixed(1) : '0';
    
    // Revenue metrics
    const totalQuotedValue = filteredRFQs.reduce((sum, r) => sum + (r.quotation_amount || 0), 0);
    const acceptedValue = filteredRFQs.filter(r => r.status === 'accepted').reduce((sum, r) => sum + (r.quotation_amount || 0), 0);
    
    // Shipment metrics
    const totalShipments = filteredShipments.length;
    const deliveredShipments = filteredShipments.filter(s => s.status === 'delivered').length;
    const inTransitShipments = filteredShipments.filter(s => ['in_transit', 'departed_origin'].includes(s.status)).length;
    const successRate = totalShipments > 0 ? ((deliveredShipments / totalShipments) * 100).toFixed(1) : '0';
    
    // User activity
    const activeUsers = new Set(filteredActivities.map(a => a.performed_by)).size;
    const avgActivitiesPerDay = filteredActivities.length / Math.max(1, Math.ceil((dateFilter.end - dateFilter.start) / (1000 * 60 * 60 * 24)));
    
    return {
      totalRFQs, pendingRFQs, acceptedRFQs, rejectedRFQs, conversionRate,
      totalQuotedValue, acceptedValue,
      totalShipments, deliveredShipments, inTransitShipments, successRate,
      activeUsers, avgActivitiesPerDay: avgActivitiesPerDay.toFixed(1)
    };
  }, [filteredRFQs, filteredShipments, filteredActivities, dateFilter]);

  // RFQ by mode
  const rfqByMode = {};
  filteredRFQs.forEach(r => { rfqByMode[r.mode] = (rfqByMode[r.mode] || 0) + 1; });
  const modeData = Object.entries(rfqByMode).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // RFQ status
  const rfqByStatus = {};
  filteredRFQs.forEach(r => { rfqByStatus[r.status] = (rfqByStatus[r.status] || 0) + 1; });
  const statusData = Object.entries(rfqByStatus).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Shipment status
  const shipmentByStatus = {};
  filteredShipments.forEach(s => { shipmentByStatus[s.status] = (shipmentByStatus[s.status] || 0) + 1; });
  const shipmentStatusData = Object.entries(shipmentByStatus).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Top routes
  const routeCounts = {};
  filteredRFQs.forEach(r => {
    const route = `${r.origin} → ${r.destination}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Time series data
  const timeSeriesData = useMemo(() => {
    const days = Math.ceil((dateFilter.end - dateFilter.start) / (1000 * 60 * 60 * 24));
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = startOfDay(subDays(dateFilter.end, days - i - 1));
      const dateStr = format(date, 'MMM dd');
      
      const dayRFQs = filteredRFQs.filter(r => {
        const d = startOfDay(parseISO(r.created_date));
        return d.getTime() === date.getTime();
      }).length;
      
      const dayShipments = filteredShipments.filter(s => {
        const d = startOfDay(parseISO(s.created_date));
        return d.getTime() === date.getTime();
      }).length;
      
      const dayActivities = filteredActivities.filter(a => {
        const d = startOfDay(parseISO(a.created_date));
        return d.getTime() === date.getTime();
      }).length;
      
      data.push({ date: dateStr, rfqs: dayRFQs, shipments: dayShipments, activities: dayActivities });
    }
    
    return data;
  }, [filteredRFQs, filteredShipments, filteredActivities, dateFilter]);

  // Export function
  const handleExport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      date_range: {
        start: format(dateFilter.start, 'yyyy-MM-dd'),
        end: format(dateFilter.end, 'yyyy-MM-dd')
      },
      metrics,
      rfq_by_mode: rfqByMode,
      rfq_by_status: rfqByStatus,
      shipment_by_status: shipmentByStatus,
      top_routes: routeCounts,
      time_series: timeSeriesData
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tact-freight-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics & Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Comprehensive business intelligence and performance metrics</p>
        </div>
        <Button onClick={handleExport} className="bg-[#D50000] hover:bg-[#B00000]">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </>
            )}
            
            <div className="text-sm text-gray-500">
              Showing data from <strong>{format(dateFilter.start, 'MMM dd, yyyy')}</strong> to <strong>{format(dateFilter.end, 'MMM dd, yyyy')}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total RFQs" value={metrics.totalRFQs} icon={FileText} iconColor="text-blue-600" />
        <StatsCard title="Pending RFQs" value={metrics.pendingRFQs} icon={Clock} iconColor="text-orange-600" />
        <StatsCard title="Total Shipments" value={metrics.totalShipments} icon={Package} iconColor="text-purple-600" />
        <StatsCard title="Active Users" value={metrics.activeUsers} icon={Users} iconColor="text-green-600" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Quoted Value" value={`$${metrics.totalQuotedValue.toLocaleString()}`} icon={DollarSign} iconColor="text-green-600" />
        <StatsCard title="Accepted Value" value={`$${metrics.acceptedValue.toLocaleString()}`} icon={CheckCircle} iconColor="text-green-600" />
        <StatsCard title="Conversion Rate" value={`${metrics.conversionRate}%`} icon={TrendingUp} iconColor="text-blue-600" />
        <StatsCard title="Success Rate" value={`${metrics.successRate}%`} icon={CheckCircle} iconColor="text-green-600" />
      </div>

      {/* Time Series */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorRFQs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D50000" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D50000" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="rfqs" stroke="#D50000" fillOpacity={1} fill="url(#colorRFQs)" name="RFQs" />
              <Area type="monotone" dataKey="shipments" stroke="#1A1A1A" fillOpacity={1} fill="url(#colorShipments)" name="Shipments" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">RFQs by Transport Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {modeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">RFQ Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#D50000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={shipmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {shipmentStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">RFQ Conversion Rate</span>
                <span className="text-lg font-bold text-[#D50000]">{metrics.conversionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-[#D50000] h-3 rounded-full transition-all" style={{ width: `${metrics.conversionRate}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{metrics.acceptedRFQs} accepted out of {metrics.totalRFQs} total</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Shipment Success Rate</span>
                <span className="text-lg font-bold text-green-600">{metrics.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full transition-all" style={{ width: `${metrics.successRate}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{metrics.deliveredShipments} delivered out of {metrics.totalShipments} total</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500">Avg Activities/Day</p>
                <p className="text-xl font-bold text-[#1A1A1A]">{metrics.avgActivitiesPerDay}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">In Transit</p>
                <p className="text-xl font-bold text-blue-600">{metrics.inTransitShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Trade Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topRoutes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={200} />
              <Tooltip />
              <Bar dataKey="value" fill="#1A1A1A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}