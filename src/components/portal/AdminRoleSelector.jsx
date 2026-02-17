import React from 'react';
import { useRole } from '../utils/roleContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';

export default function AdminRoleSelector() {
  const { actingAsRole, defaultRole, changeActingRole, setAsDefault, availableRoles } = useRole();

  if (!actingAsRole && !defaultRole) {
    return null; // Not an admin or not acting as anyone
  }

  return (
    <div className="px-3 py-3 border-b border-white/10 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Acting As</p>
      <div className="flex items-center gap-2">
        <Select value={actingAsRole || ''} onValueChange={changeActingRole}>
          <SelectTrigger className="h-8 bg-white/10 border-white/20 text-white text-xs">
            <SelectValue placeholder="Select role..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>None (Admin)</SelectItem>
            {availableRoles.map(role => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {actingAsRole && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setAsDefault(actingAsRole)}
            className={`h-8 w-8 ${defaultRole === actingAsRole ? 'text-yellow-400' : 'text-white/40 hover:text-white/60'}`}
            title={defaultRole === actingAsRole ? 'Default role set' : 'Set as default'}
          >
            <Star className="w-4 h-4" fill="currentColor" />
          </Button>
        )}
      </div>
    </div>
  );
}