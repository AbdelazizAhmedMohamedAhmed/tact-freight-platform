import React from 'react';
import { Card } from "@/components/ui/card";

export default function StatsCard({ title, value, icon: Icon, color = 'bg-[#D50000]', trend }) {
  return (
    <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-[#1A1A1A] mt-2">{value}</p>
          {trend && <p className="text-xs text-green-600 font-medium mt-2">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6`} style={{ color: color.includes('#') ? color.replace('bg-[', '').replace(']', '') : undefined }} />
        </div>
      </div>
    </Card>
  );
}