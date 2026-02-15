import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Edit2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

const deptColors = {
  client: 'bg-blue-100 text-blue-800', sales: 'bg-green-100 text-green-800',
  pricing: 'bg-purple-100 text-purple-800', operations: 'bg-orange-100 text-orange-800',
  admin: 'bg-red-100 text-red-800',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviteDept, setInviteDept] = useState('client');
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole);
    setInviting(false);
    setInviteOpen(false);
    setInviteEmail('');
    refetch();
  };

  const handleUpdateDept = async (dept) => {
    if (!editUser) return;
    await base44.entities.User.update(editUser.id, { department: dept });
    setEditUser(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all system users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setInviteOpen(true)} className="bg-[#D50000] hover:bg-[#B00000]">
            <UserPlus className="w-4 h-4 mr-2" /> Invite User
          </Button>
        </div>
      </div>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{u.email}</TableCell>
                  <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                  <TableCell>
                    <Badge className={deptColors[u.department] || 'bg-gray-100 text-gray-800'}>
                      {u.department || 'client'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '-'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setEditUser(u)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label>Email</Label><Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@company.com" /></div>
            <div className="space-y-2">
              <Label>App Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="bg-[#D50000] hover:bg-[#B00000] w-full">
              {inviting ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User Department</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">{editUser.full_name} ({editUser.email})</p>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={editUser.department || 'client'} onValueChange={handleUpdateDept}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="pricing">Pricing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}