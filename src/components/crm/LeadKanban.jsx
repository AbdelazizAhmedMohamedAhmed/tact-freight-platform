import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, User, ChevronRight, ChevronLeft } from 'lucide-react';

const STAGES = [
  { key: 'new', label: 'New', color: 'bg-gray-100 text-gray-700' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { key: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: 'bg-purple-100 text-purple-700' },
  { key: 'won', label: 'Won', color: 'bg-green-100 text-green-700' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
];

export default function LeadKanban({ leads, onEdit, onStageChange }) {
  const leadsByStage = STAGES.reduce((acc, s) => {
    acc[s.key] = leads.filter(l => l.stage === s.key);
    return acc;
  }, {});

  const moveLeft = (lead) => {
    const idx = STAGES.findIndex(s => s.key === lead.stage);
    if (idx > 0) onStageChange(lead.id, STAGES[idx - 1].key);
  };
  const moveRight = (lead) => {
    const idx = STAGES.findIndex(s => s.key === lead.stage);
    if (idx < STAGES.length - 1) onStageChange(lead.id, STAGES[idx + 1].key);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {STAGES.map(stage => (
          <div key={stage.key} className="w-64 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${stage.color} font-semibold`}>{stage.label}</Badge>
              <span className="text-xs text-gray-400">{leadsByStage[stage.key].length}</span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {leadsByStage[stage.key].map(lead => (
                <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit(lead)}>
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A] leading-tight">{lead.company_name}</p>
                      <p className="text-xs text-gray-500">{lead.contact_person}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {lead.value_usd && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="w-3 h-3" />{lead.value_usd.toLocaleString()}
                        </span>
                      )}
                      {lead.follow_up_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{lead.follow_up_date}
                        </span>
                      )}
                    </div>
                    {lead.assigned_to_name && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <User className="w-3 h-3" />{lead.assigned_to_name}
                      </div>
                    )}
                    <div className="flex items-center gap-1 pt-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => moveLeft(lead)} className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-3 h-3 text-gray-400" /></button>
                      <button onClick={() => moveRight(lead)} className="p-1 rounded hover:bg-gray-100"><ChevronRight className="w-3 h-3 text-gray-400" /></button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}