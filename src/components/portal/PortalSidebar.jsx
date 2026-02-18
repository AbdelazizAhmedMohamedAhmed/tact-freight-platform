import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import Logo from '../shared/Logo';
import { 
  LayoutDashboard, FileText, Truck, Users, LogOut, Menu, X, 
  Ship, ClipboardList, DollarSign, Package, BarChart3, MessageSquare, Plus,
  Building2, Handshake, UserCircle, ArrowLeft, TrendingUp, Bell
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { logAuthAction } from '../utils/activityLogger';
import AdminRoleSelector from './AdminRoleSelector';

const menuByRole = {
  user: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'ClientDashboard' },
    { label: 'New RFQ', icon: Plus, page: 'ClientCreateRFQ' },
    { label: 'My RFQs', icon: FileText, page: 'ClientRFQs' },
    { label: 'My Shipments', icon: Ship, page: 'ClientShipments' },
    { label: 'Track Shipment', icon: Truck, page: 'TrackShipment' },
    { label: 'My Reports', icon: TrendingUp, page: 'ClientReporting' },
    { label: 'Notifications', icon: Bell, page: 'Notifications' },
  ],
  sales: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'SalesDashboard' },
    { label: 'Create RFQ', icon: Plus, page: 'SalesCreateRFQ' },
    { label: 'RFQ Queue', icon: ClipboardList, page: 'SalesRFQQueue' },
    { label: 'CRM — Leads', icon: Users, page: 'SalesCRM' },
    { label: 'Companies', icon: Building2, page: 'SalesCompanies' },
    { label: 'Manage Pricing', icon: DollarSign, page: 'SalesManagePricing' },
    { label: 'Notifications', icon: Bell, page: 'Notifications' },
  ],
  bizdev: [
    { label: 'Partners & Agents', icon: Handshake, page: 'BizDevPartners' },
    { label: 'Companies', icon: Building2, page: 'SalesCompanies' },
  ],
  pricing: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'PricingDashboard' },
    { label: 'Pricing Queue', icon: DollarSign, page: 'PricingQueue' },
    { label: 'Create Quotation', icon: FileText, page: 'PricingCreateQuotation' },
    { label: 'Contact Sales', icon: MessageSquare, page: 'PricingContactSales' },
  ],
  operations: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'OperationsDashboard' },
    { label: 'Shipments', icon: Ship, page: 'OperationsShipments' },
    { label: 'Create Shipment', icon: Package, page: 'CreateShipment' },
    { label: 'Pending Amendments', icon: FileText, page: 'PendingAmendments' },
    { label: 'Notifications', icon: Bell, page: 'Notifications' },
  ],
  customer_service: [
    { label: 'RFQs', icon: FileText, page: 'AdminRFQs' },
    { label: 'Shipments', icon: Ship, page: 'AdminShipments' },
    { label: 'Track Shipment', icon: Truck, page: 'TrackShipment' },
  ],
  analyst: [
    { label: 'Reporting', icon: TrendingUp, page: 'Reporting' },
    { label: 'Activity Log', icon: FileText, page: 'AdminActivity' },
  ],
  supervisor: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'SupervisorDashboard' },
    { label: 'RFQs', icon: FileText, page: 'SupervisorRFQs' },
    { label: 'Shipments', icon: Ship, page: 'SupervisorShipments' },
    { label: 'Activity Log', icon: BarChart3, page: 'AdminActivity' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'AdminDashboard' },
    { label: 'RFQs', icon: FileText, page: 'AdminRFQs' },
    { label: 'Shipments', icon: Ship, page: 'AdminShipments' },
    { label: 'Pricing Queue', icon: DollarSign, page: 'PricingQueue' },
    { label: 'Create Quotation', icon: ClipboardList, page: 'PricingCreateQuotation' },
    { label: 'Users', icon: Users, page: 'AdminUsers' },
    { label: 'Clients', icon: Building2, page: 'AdminClients' },
    { label: 'Reporting', icon: TrendingUp, page: 'Reporting' },
    { label: 'Activity Log', icon: BarChart3, page: 'AdminActivity' },
  ],
};

const roleLabels = {
  user: 'Client Portal',
  sales: 'Sales Portal',
  pricing: 'Pricing Portal',
  operations: 'Operations Portal',
  supervisor: 'Supervisor Portal',
  bizdev: 'Biz Dev Portal',
  admin: 'Admin Portal',
  customer_service: 'Customer Service',
  analyst: 'Analyst Portal',
};

export default function PortalSidebar({ userRole, currentPage }) {
  const [collapsed, setCollapsed] = useState(false);
  const menu = menuByRole[userRole] || menuByRole.user;

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
            {roleLabels[userRole] || 'Portal'}
          </span>
        </div>
      )}

      {!collapsed && userRole === 'admin' && <AdminRoleSelector />}

      <nav className="flex-1 px-2 py-2 space-y-1">
        {menu.map(item => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
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
          to={createPageUrl('Profile')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
            ${currentPage === 'Profile' ? 'bg-[#D50000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}
          `}
        >
          <UserCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>My Account</span>}
        </Link>

        <Link
          to={createPageUrl('Home')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Back to Website</span>}
        </Link>

        <button 
          onClick={async () => {
            await logAuthAction('logout', 'User logged out');
            base44.auth.logout();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}