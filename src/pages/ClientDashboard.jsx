import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import RFQCard from '../components/portal/RFQCard';
import ShipmentCard from '../components/portal/ShipmentCard';
import { Plus, FileText, Ship, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setCompanyId(u.company_id || null);
    }).catch(() => {});
  }, []);

  const { data: rfqs = [] } = useQuery({
    queryKey: ['my-rfqs', companyId, user?.email],
    queryFn: () => companyId
      ? base44.entities.RFQ.filter({ company_id: companyId }, '-created_date', 10)
      : base44.entities.RFQ.filter({ client_email: user.email }, '-created_date', 10),
    enabled: !!user,
  });

  const { data: shipments = [] } = useQuery({
    queryKey: ['my-shipments', companyId, user?.email],
    queryFn: () => companyId
      ? base44.entities.Shipment.filter({ company_id: companyId }, '-updated_date', 10)
      : base44.entities.Shipment.filter({ client_email: user.email }, '-updated_date', 10),
    enabled: !!user,
  });

  const activeShipments = shipments.filter(s => s.status !== 'delivered');
  const pendingRFQs = rfqs.filter(r => !['client_confirmed', 'rejected'].includes(r.status));

  return (
    <div className="space-y-8">
      {/* Company setup reminder */}
      {user && !user.company_id && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Complete your company profile</p>
              <p className="text-xs text-amber-600 mt-0.5">Add your company details to get personalised quotes and full portal access.</p>
            </div>
          </div>
          <Link to={createPageUrl('CompanyRegistration')}>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap flex-shrink-0">
              Set Up Now <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A1A]">Welcome back, {user?.full_name || 'Client'}</h1>
          <p className="text-gray-500 mt-1">Manage your shipments and requests</p>
        </div>
        <Link to={createPageUrl('ClientRFQs') + '?action=new'}>
          <Button className="bg-[#D50000] hover:bg-[#B00000] h-12 px-6">
            <Plus className="w-5 h-5 mr-2" /> New RFQ
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Shipments</p>
              <p className="text-3xl font-bold text-[#D50000] mt-2">{activeShipments.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#D50000]/10 flex items-center justify-center">
              <Ship className="w-6 h-6 text-[#D50000]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending RFQs</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{pendingRFQs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total RFQs</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{rfqs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Recent RFQs</h2>
            <Link to={createPageUrl('ClientRFQs')}>
              <Button variant="ghost" size="sm" className="text-[#D50000]">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {rfqs.slice(0, 3).map(rfq => (
              <RFQCard key={rfq.id} rfq={rfq} onClick={() => window.location.href = createPageUrl('ClientRFQs') + '?id=' + rfq.id} />
            ))}
            {rfqs.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No RFQs yet</p>
                <Link to={createPageUrl('ClientRFQs') + '?action=new'}>
                  <Button className="bg-[#D50000] hover:bg-[#B00000] mt-4">Create Your First RFQ</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Active Shipments</h2>
            <Link to={createPageUrl('ClientShipments')}>
              <Button variant="ghost" size="sm" className="text-[#D50000]">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {activeShipments.slice(0, 3).map(shipment => (
              <ShipmentCard key={shipment.id} shipment={shipment} onClick={() => window.location.href = createPageUrl('TrackShipment') + '?tracking=' + shipment.tracking_number} />
            ))}
            {activeShipments.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Ship className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active shipments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}