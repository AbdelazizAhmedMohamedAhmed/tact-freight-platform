import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import Logo from './Logo';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FileText, Truck, Users, Settings, LogOut, 
  Menu, X, ChevronRight, BarChart3, Bell, Package, DollarSign, 
  ClipboardList, Ship, Activity, Home
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const portalMenus = {
  client: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'ClientDashboard' },
    { label: 'Submit RFQ', icon: FileText, page: 'RequestQuote' },
    { label: 'My RFQs', icon: ClipboardList, page: 'ClientRFQs' },
    { label: 'Shipments', icon: Ship, page: 'ClientShipments' },
    { label: 'Track', icon: Truck, page: 'TrackShipment' },
    { label: 'Support', icon: Bell, page: 'ClientSupport' },
    { label: 'Preferences', icon: Settings, page: 'ClientPreferences' },
  ],
  sales: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'SalesDashboard' },
    { label: 'RFQ Queue', icon: ClipboardList, page: 'SalesRFQQueue' },
    { label: 'All RFQs', icon: FileText, page: 'SalesRFQQueue' },
  ],
  pricing: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'PricingDashboard' },
    { label: 'Pricing Queue', icon: DollarSign, page: 'PricingQueue' },
  ],
  operations: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'OperationsDashboard' },
    { label: 'Shipments', icon: Ship, page: 'OperationsShipments' },
    { label: 'Workflow', icon: Activity, page: 'OperationsFlow' },
    { label: 'Create Shipment', icon: Package, page: 'CreateShipment' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'AdminDashboard' },
    { label: 'Users', icon: Users, page: 'AdminUsers' },
    { label: 'All RFQs', icon: FileText, page: 'AdminRFQs' },
    { label: 'All Shipments', icon: Ship, page: 'AdminShipments' },
    { label: 'Activity Log', icon: Activity, page: 'AdminActivity' },
    { label: 'Analytics', icon: BarChart3, page: 'AdminAnalytics' },
    { label: 'Reporting', icon: BarChart3, page: 'AdminReporting' },
  ],
};

export default function PortalSidebar({ department, currentPage }) {
  const [collapsed, setCollapsed] = useState(false);
  const menu = portalMenus[department] || portalMenus.client;

  const deptLabels = {
    client: 'Client Portal',
    sales: 'Sales Portal',
    pricing: 'Pricing Portal',
    operations: 'Operations Portal',
    admin: 'Admin Portal',
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-[#1A1A1A] min-h-screen flex flex-col transition-all duration-300 flex-shrink-0`}>
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        {!collapsed && <Logo white size="sm" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D50000]">
            {deptLabels[department]}
          </span>
        </div>
      )}

      <nav className="flex-1 px-2 py-2 space-y-1">
        {menu.map(item => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page + item.label}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-[#D50000] text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          to={createPageUrl('Home')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <Home className="w-5 h-5" />
          {!collapsed && <span>Back to Website</span>}
        </Link>
        <button 
          onClick={() => base44.auth.logout(createPageUrl('Home'))}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}