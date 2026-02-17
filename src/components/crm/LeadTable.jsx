import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from 'lucide-react';

const stageBadge = {
  new: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-yellow-100 text-yellow-700',
  proposal_sent: 'bg-purple-100 text-purple-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

export default function LeadTable({ leads, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Company', 'Contact', 'Stage', 'Value', 'Source', 'Follow-up', 'Assigned', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#1A1A1A]">{lead.company_name}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div>{lead.contact_person}</div>
                  <div className="text-xs text-gray-400">{lead.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${stageBadge[lead.stage]} capitalize`}>{lead.stage?.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-3 text-green-600 font-medium">
                  {lead.value_usd ? `$${lead.value_usd.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 capitalize">{lead.source || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{lead.follow_up_date || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{lead.assigned_to_name || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(lead)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(lead.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <div className="text-center py-12 text-gray-400">No leads found.</div>}
      </div>
    </div>
  );
}