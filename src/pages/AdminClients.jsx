import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, User } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import ClientManagementModal from '../components/admin/ClientManagementModal';

export default function AdminClients() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-clients-list'],
    queryFn: () => base44.entities.ClientCompany.list('-created_date', 200),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-for-clients'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  // Map email -> user
  const emailToUser = {};
  users.forEach(u => { if (u.email) emailToUser[u.email] = u; });

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.primary_contact_email?.toLowerCase().includes(search.toLowerCase()) ||
    c.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Building2 className="w-6 h-6" /> Clients
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage client companies</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search clients..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-[#D50000] hover:bg-[#B00000]">
            <Building2 className="w-4 h-4 mr-2" /> Add Client
          </Button>
        </div>
      </div>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Company Name</TableHead>
                <TableHead>Primary Email</TableHead>
                <TableHead>Linked Users</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(c => {
                  const memberEmails = c.member_emails || (c.primary_contact_email ? [c.primary_contact_email] : []);
                  const linkedUsers = memberEmails.map(e => emailToUser[e]).filter(Boolean);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{c.primary_contact_email}</TableCell>
                      <TableCell>
                        {linkedUsers.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {linkedUsers.map(u => (
                              <span key={u.id} className="flex items-center gap-1.5 text-sm">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium">{u.full_name || u.email}</span>
                                {u.full_name && <span className="text-xs text-gray-400">{u.email}</span>}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No linked users</span>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline">{c.country || '-'}</Badge></TableCell>
                      <TableCell className="text-sm">{c.industry || '-'}</TableCell>
                      <TableCell className="text-sm text-gray-500">{c.created_date ? format(new Date(c.created_date), 'MMM d, yyyy') : '-'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ClientManagementModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={refetch} />
    </div>
  );
}