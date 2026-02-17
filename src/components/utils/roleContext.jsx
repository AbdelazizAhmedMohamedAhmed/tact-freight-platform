import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const RoleContext = createContext();

// These are the roles admins can act as
const ACTABLE_ROLES = ['sales', 'pricing', 'operations'];

export function RoleProvider({ children, userRole }) {
  const [actingAsRole, setActingAsRole] = useState(null);
  const [defaultRole, setDefaultRole] = useState(null);

  // Load default role from user preferences on mount
  useEffect(() => {
    if (userRole === 'admin') {
      base44.auth.me().then(user => {
        if (user && user.default_acting_role) {
          setDefaultRole(user.default_acting_role);
          setActingAsRole(user.default_acting_role);
        }
      });
    }
  }, [userRole]);

  // Get effective role (the role being acted as, or user's actual role)
  const effectiveRole = (userRole === 'admin' && actingAsRole) ? actingAsRole : userRole;

  const changeActingRole = async (newRole) => {
    if (userRole !== 'admin') return;
    
    // Validate role
    if (newRole && !ACTABLE_ROLES.includes(newRole)) return;
    
    setActingAsRole(newRole);
  };

  const setAsDefault = async (role) => {
    if (userRole !== 'admin') return;
    
    await base44.auth.updateMe({ default_acting_role: role });
    setDefaultRole(role);
  };

  const value = {
    userRole,
    effectiveRole,
    actingAsRole,
    defaultRole,
    isActingAs: userRole === 'admin' && actingAsRole !== null,
    canActAs: userRole === 'admin',
    changeActingRole,
    setAsDefault,
    availableRoles: ACTABLE_ROLES,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}