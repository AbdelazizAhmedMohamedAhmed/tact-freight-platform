import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const WORKFLOW_STAGES = [
  { id: 1, name: 'Booking Confirmed', icon: CheckCircle2, color: 'text-green-600' },
  { id: 2, name: 'Cargo Received', icon: CheckCircle2, color: 'text-green-600' },
  { id: 3, name: 'Customs Export', icon: Clock, color: 'text-blue-600' },
  { id: 4, name: 'Departed', icon: Clock, color: 'text-blue-600' },
  { id: 5, name: 'In Transit', icon: Clock, color: 'text-blue-600' },
  { id: 6, name: 'Arrived', icon: CheckCircle2, color: 'text-green-600' },
  { id: 7, name: 'Customs Clearance', icon: AlertCircle, color: 'text-orange-600' },
  { id: 8, name: 'Delivered', icon: CheckCircle2, color: 'text-green-600' },
];

export default function OperationsFlow() {
  const [filter, setFilter] = useState('all');

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['operations-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 100),
  });

  const filtered = filter === 'all' ? shipments :
    filter === 'pending' ? shipments.filter(s => ['cargo_received', 'customs_export', 'in_transit'].includes(s.status)) :
    filter === 'delayed' ? shipments.filter(s => s.status === 'customs_clearance') :
    shipments.filter(s => s.status === 'delivered');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Shipment Operations</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor and manage shipment workflows</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({shipments.length})</TabsTrigger>
          <TabsTrigger value="pending">In Progress ({shipments.filter(s => !['delivered'].includes(s.status)).length})</TabsTrigger>
          <TabsTrigger value="delayed">At Customs ({shipments.filter(s => s.status === 'customs_clearance').length})</TabsTrigger>
          <TabsTrigger value="completed">Delivered ({shipments.filter(s => s.status === 'delivered').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(shipment => {
            const currentStageIndex = WORKFLOW_STAGES.findIndex(s => s.id.toString() === shipment.status?.charAt(0) || s.name.toLowerCase().includes(shipment.status?.split('_')[0]));
            
            return (
              <div key={shipment.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-[#1A1A1A]">{shipment.tracking_number}</h3>
                    <p className="text-sm text-gray-500 mt-1">{shipment.company_name} • {shipment.origin} → {shipment.destination}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {shipment.mode?.toUpperCase()}
                  </span>
                </div>

                {/* Workflow Timeline */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                  {WORKFLOW_STAGES.map((stage, i) => {
                    const isCompleted = i <= currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    const Icon = stage.icon;

                    return (
                      <React.Fragment key={stage.id}>
                        <div className={`flex flex-col items-center gap-2 ${isCompleted ? stage.color : 'text-gray-300'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? `${stage.color.replace('text-', 'bg-')}/20` : 'bg-gray-100'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-medium text-center whitespace-nowrap max-w-16">{stage.name}</p>
                        </div>
                        {i < WORKFLOW_STAGES.length - 1 && (
                          <ArrowRight className={`w-4 h-4 mx-1 ${isCompleted ? 'text-green-600' : 'text-gray-300'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    ETA: {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'TBD'}
                  </p>
                  <Button size="sm" className="bg-[#D50000] hover:bg-[#B00000]">
                    Update Status
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}