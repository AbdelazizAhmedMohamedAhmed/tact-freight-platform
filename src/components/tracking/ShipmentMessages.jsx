import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MessageThread from '../messaging/MessageThread';
import { MessageSquare } from 'lucide-react';

export default function ShipmentMessages({ shipment, userRole = 'client' }) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-[#D50000]" />
          Communication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MessageThread entityType="shipment" entityId={shipment.id} userRole={userRole} />
      </CardContent>
    </Card>
  );
}