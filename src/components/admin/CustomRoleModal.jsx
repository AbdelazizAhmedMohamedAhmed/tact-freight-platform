import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const MODULES = {
  rfqs: {
    label: 'RFQs',
    actions: [
      { key: 'view', label: 'View own RFQs' },
      { key: 'viewAll', label: 'View all RFQs' },
      { key: 'create', label: 'Create RFQ' },
      { key: 'edit', label: 'Edit RFQ' },
      { key: 'delete', label: 'Delete RFQ' },
      { key: 'assign', label: 'Assign RFQ to team' },
      { key: 'updateStatus', label: 'Update status' },
      { key: 'uploadQuotation', label: 'Upload quotation' },
      { key: 'sendToClient', label: 'Send to client' },
      { key: 'acceptReject', label: 'Accept / Reject quote' },
    ]
  },
  shipments: {
    label: 'Shipments',
    actions: [
      { key: 'view', label: 'View own shipments' },
      { key: 'viewAll', label: 'View all shipments' },
      { key: 'create', label: 'Create shipment' },
      { key: 'edit', label: 'Edit shipment' },
      { key: 'delete', label: 'Delete shipment' },
      { key: 'updateStatus', label: 'Update status' },
      { key: 'assign', label: 'Assign operations' },
      { key: 'uploadDocuments', label: 'Upload documents' },
    ]
  },
  users: {
    label: 'Users',
    actions: [
      { key: 'view', label: 'View users' },
      { key: 'create', label: 'Create users' },
      { key: 'edit', label: 'Edit users' },
      { key: 'delete', label: 'Delete users' },
      { key: 'invite', label: 'Invite users' },
    ]
  },
  clients: {
    label: 'Clients',
    actions: [
      { key: 'view', label: 'View clients' },
      { key: 'create', label: 'Create clients' },
      { key: 'edit', label: 'Edit clients' },
      { key: 'delete', label: 'Delete clients' },
    ]
  },
  messages: {
    label: 'Messages',
    actions: [
      { key: 'view', label: 'View messages' },
      { key: 'create', label: 'Send messages' },
      { key: 'viewInternal', label: 'View internal messages' },
      { key: 'createInternal', label: 'Create internal messages' },
    ]
  },
  analytics: {
    label: 'Analytics',
    actions: [
      { key: 'view', label: 'View full analytics' },
      { key: 'viewDepartment', label: 'View department analytics' },
    ]
  },
  reporting: {
    label: 'Reporting',
    actions: [
      { key: 'view', label: 'View reports' },
    ]
  },
  activityLog: {
    label: 'Activity Log',
    actions: [
      { key: 'view', label: 'View activity log' },
    ]
  },
};

const DEFAULT_PERMISSIONS = Object.fromEntries(
  Object.entries(MODULES).map(([mod, { actions }]) => [
    mod,
    Object.fromEntries(actions.map(a => [a.key, false]))
  ])
);

function ModuleSection({ modKey, modDef, permissions, onChange }) {
  const [expanded, setExpanded] = useState(true);
  const modPerms = permissions[modKey] || {};
  const allChecked = modDef.actions.every(a => modPerms[a.key]);
  const someChecked = modDef.actions.some(a => modPerms[a.key]);

  const toggleAll = () => {
    const newVal = !allChecked;
    const updated = Object.fromEntries(modDef.actions.map(a => [a.key, newVal]));
    onChange(modKey, updated);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <Checkbox
          checked={allChecked ? true : someChecked ? 'indeterminate' : false}
          onCheckedChange={toggleAll}
          onClick={e => e.stopPropagation()}
          className="mr-1"
        />
        <span className="font-medium text-sm">{modDef.label}</span>
        <span className="ml-auto text-xs text-gray-400">
          {modDef.actions.filter(a => modPerms[a.key]).length}/{modDef.actions.length}
        </span>
      </div>
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y">
          {modDef.actions.map(action => (
            <label key={action.key} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm">
              <Checkbox
                checked={!!modPerms[action.key]}
                onCheckedChange={val => onChange(modKey, { ...modPerms, [action.key]: !!val })}
              />
              <span className="text-gray-700">{action.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomRoleModal({ open, role, users, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!role?.id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    base_role: 'user',
    department: '',
    is_active: true,
    permissions: DEFAULT_PERMISSIONS,
    assigned_user_emails: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setForm({
        name: role.name || '',
        description: role.description || '',
        base_role: role.base_role || 'user',
        department: role.department || '',
        is_active: role.is_active !== false,
        permissions: { ...DEFAULT_PERMISSIONS, ...role.permissions },
        assigned_user_emails: role.assigned_user_emails || [],
      });
    } else {
      setForm({
        name: '',
        description: '',
        base_role: 'user',
        department: '',
        is_active: true,
        permissions: DEFAULT_PERMISSIONS,
        assigned_user_emails: [],
      });
    }
  }, [role, open]);

  const handlePermChange = (modKey, modPerms) => {
    setForm(f => ({ ...f, permissions: { ...f.permissions, [modKey]: modPerms } }));
  };

  const toggleUser = (email) => {
    setForm(f => {
      const exists = f.assigned_user_emails.includes(email);
      return {
        ...f,
        assigned_user_emails: exists
          ? f.assigned_user_emails.filter(e => e !== email)
          : [...f.assigned_user_emails, email]
      };
    });
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    const data = { ...form };
    if (!data.department) delete data.department;
    if (isEdit) {
      await base44.entities.CustomRole.update(role.id, data);
    } else {
      await base44.entities.CustomRole.create(data);
    }
    setSaving(false);
    onClose();
  };

  const filteredUsers = users.filter(u => u.role === form.base_role || (form.base_role === 'user'));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{isEdit ? 'Edit Custom Role' : 'Create Custom Role'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Junior Sales, Read-Only Ops" />
              </div>
              <div className="space-y-1.5">
                <Label>Base System Role</Label>
                <Select value={form.base_role} onValueChange={v => setForm(f => ({ ...f, base_role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Internal User</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.base_role === 'user' && (
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={form.department || ''} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select department…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Briefly describe this role's purpose…" rows={2} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label className="cursor-pointer">Active</Label>
              </div>
            </div>

            <Separator />

            {/* Permissions */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Module Permissions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Select which actions this role is allowed to perform in each module.</p>
              </div>
              <div className="space-y-2">
                {Object.entries(MODULES).map(([modKey, modDef]) => (
                  <ModuleSection
                    key={modKey}
                    modKey={modKey}
                    modDef={modDef}
                    permissions={form.permissions}
                    onChange={handlePermChange}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Assign users */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Assign Users</h3>
                <p className="text-xs text-gray-500 mt-0.5">These users will inherit this custom role's permissions.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50 text-sm">
                    <Checkbox
                      checked={form.assigned_user_emails.includes(u.email)}
                      onCheckedChange={() => toggleUser(u.email)}
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.full_name || u.email}</div>
                      <div className="text-xs text-gray-400 truncate">{u.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              {form.assigned_user_emails.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.assigned_user_emails.map(email => {
                    const u = users.find(u => u.email === email);
                    return (
                      <Badge key={email} variant="secondary" className="gap-1 pr-1">
                        {u?.full_name || email}
                        <button onClick={() => toggleUser(email)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name} className="bg-[#D50000] hover:bg-[#B00000]">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}