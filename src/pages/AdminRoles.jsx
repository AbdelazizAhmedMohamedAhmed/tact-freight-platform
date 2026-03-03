import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Shield, Pencil, Trash2, Users } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import CustomRoleModal from '../components/admin/CustomRoleModal';

const baseRoleColors = {
  admin: 'bg-red-100 text-red-800',
  user: 'bg-gray-100 text-gray-800',
  client: 'bg-blue-100 text-blue-800',
};

const deptColors = {
  sales: 'bg-green-100 text-green-800',
  pricing: 'bg-purple-100 text-purple-800',
  operations: 'bg-orange-100 text-orange-800',
  manager: 'bg-yellow-100 text-yellow-800',
};

const MODULE_LABELS = {
  rfqs: 'RFQs',
  shipments: 'Shipments',
  users: 'Users',
  messages: 'Messages',
  analytics: 'Analytics',
  activityLog: 'Activity Log',
  reporting: 'Reporting',
  clients: 'Clients',
};

function countPermissions(permissions = {}) {
  let total = 0, granted = 0;
  Object.values(permissions).forEach(mod => {
    Object.values(mod).forEach(val => {
      total++;
      if (val) granted++;
    });
  });
  return { total, granted };
}

export default function AdminRoles() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: () => base44.entities.CustomRole.list('-created_date', 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-roles'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomRole.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-roles'] }),
  });

  const handleEdit = (role) => {
    setEditRole(role);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditRole(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditRole(null);
    queryClient.invalidateQueries({ queryKey: ['custom-roles'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Custom Roles</h1>
          <p className="text-gray-500 text-sm mt-1">Define granular permission sets for users beyond the default role structure</p>
        </div>
        <Button onClick={handleNew} className="bg-[#D50000] hover:bg-[#B00000]">
          <Plus className="w-4 h-4 mr-2" /> New Role
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : roles.length === 0 ? (
        <Card className="p-12 text-center text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No custom roles yet</p>
          <p className="text-sm mt-1">Create your first custom role to assign granular permissions to users.</p>
          <Button onClick={handleNew} className="mt-4 bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-2" /> Create First Role
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map(role => {
            const { granted, total } = countPermissions(role.permissions);
            const assignedUsers = users.filter(u => (role.assigned_user_emails || []).includes(u.email));
            return (
              <Card key={role.id} className="p-5 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-[#D50000]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A1A] text-sm">{role.name}</h3>
                      {role.description && <p className="text-xs text-gray-500 line-clamp-1">{role.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(role)} className="h-7 w-7 p-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(role.id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge className={baseRoleColors[role.base_role] || 'bg-gray-100 text-gray-800'}>
                    {role.base_role}
                  </Badge>
                  {role.department && (
                    <Badge className={deptColors[role.department] || 'bg-gray-100 text-gray-800'}>
                      {role.department}
                    </Badge>
                  )}
                  {!role.is_active && <Badge className="bg-gray-100 text-gray-500">Inactive</Badge>}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Permissions granted</span>
                    <span className="font-medium">{granted}/{total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-[#D50000] h-1.5 rounded-full transition-all"
                      style={{ width: total > 0 ? `${(granted / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Object.entries(role.permissions || {}).map(([mod, actions]) => {
                    const anyGranted = Object.values(actions).some(Boolean);
                    if (!anyGranted) return null;
                    return (
                      <span key={mod} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {MODULE_LABELS[mod] || mod}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 border-t pt-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {assignedUsers.length === 0
                      ? 'No users assigned'
                      : assignedUsers.length === 1
                        ? assignedUsers[0].full_name || assignedUsers[0].email
                        : `${assignedUsers.length} users assigned`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <CustomRoleModal
          open={modalOpen}
          role={editRole}
          users={users}
          onClose={handleClose}
        />
      )}
    </div>
  );
}