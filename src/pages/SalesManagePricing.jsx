import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Edit2, Mail, Phone } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { logUserAction } from '@/components/utils/activityLogger';

export default function SalesManagePricing() {
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['pricing-users-list'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 200);
      return allUsers.filter(u => u.department === 'pricing');
    },
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, 'user');
      
      await logUserAction(
        { email: inviteEmail, role: 'user', department: 'pricing' },
        'user_invited',
        `Pricing user ${inviteEmail} invited by sales team`
      );
      
      setInviteOpen(false);
      setInviteEmail('');
      refetch();
    } catch (error) {
      console.error('Failed to invite user:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateInfo = async (userId, updates) => {
    if (!editUser) return;
    
    await base44.entities.User.update(userId, updates);
    
    await logUserAction(
      editUser,
      'user_dept_changed',
      `Pricing user ${editUser.email} information updated by sales`,
      { updates }
    );
    
    setEditUser(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Manage Pricing Team</h1>
          <p className="text-gray-500 text-sm mt-1">Invite and manage pricing team members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search pricing users..." 
              className="pl-10" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <Button onClick={() => setInviteOpen(true)} className="bg-[#D50000] hover:bg-[#B00000]">
            <UserPlus className="w-4 h-4 mr-2" /> Invite Pricing User
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
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-12">
                    No pricing team members found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {u.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {u.phone}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-800">
                        Pricing
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setEditUser(u)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Pricing Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              The invited user will be assigned to the Pricing department automatically.
            </p>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                value={inviteEmail} 
                onChange={e => setInviteEmail(e.target.value)} 
                placeholder="pricing.user@company.com"
                type="email"
              />
            </div>
            <Button 
              onClick={handleInvite} 
              disabled={inviting || !inviteEmail.trim()} 
              className="bg-[#D50000] hover:bg-[#B00000] w-full"
            >
              {inviting ? 'Sending Invite...' : 'Send Invite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pricing Team Member Details</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="text-gray-600">{editUser.full_name || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{editUser.email}</span>
                </div>
                {editUser.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{editUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-700">Role:</span>
                  <Badge variant="outline">{editUser.role}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-700">Department:</span>
                  <Badge className="bg-purple-100 text-purple-800">Pricing</Badge>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Note: Users can update their own contact information from their profile page.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}