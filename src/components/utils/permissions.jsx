// Role-based permissions system for Tact Freight

const ROLES = {
  CLIENT: 'client',
  SALES: 'sales',
  PRICING: 'pricing',
  OPERATIONS: 'operations',
  ADMIN: 'admin',
  CUSTOMER_SERVICE: 'customer_service',
  ANALYST: 'analyst',
};

// Define permissions for each module and action
const PERMISSIONS = {
  rfqs: {
    view: [ROLES.CLIENT, ROLES.SALES, ROLES.PRICING, ROLES.ADMIN, ROLES.CUSTOMER_SERVICE],
    create: [ROLES.CLIENT, ROLES.ADMIN],
    edit: [ROLES.SALES, ROLES.PRICING, ROLES.ADMIN],
    delete: [ROLES.ADMIN],
    viewAll: [ROLES.SALES, ROLES.PRICING, ROLES.ADMIN, ROLES.CUSTOMER_SERVICE], // Can view all RFQs, not just own
    assign: [ROLES.ADMIN],
    updateStatus: [ROLES.SALES, ROLES.PRICING, ROLES.ADMIN],
    uploadQuotation: [ROLES.PRICING, ROLES.ADMIN],
    sendToClient: [ROLES.SALES, ROLES.ADMIN],
    acceptReject: [ROLES.CLIENT] // Client can accept/reject their own RFQs
  },
  shipments: {
    view: [ROLES.CLIENT, ROLES.OPERATIONS, ROLES.ADMIN, ROLES.CUSTOMER_SERVICE],
    create: [ROLES.OPERATIONS, ROLES.ADMIN],
    edit: [ROLES.OPERATIONS, ROLES.ADMIN],
    delete: [ROLES.ADMIN],
    viewAll: [ROLES.OPERATIONS, ROLES.ADMIN, ROLES.CUSTOMER_SERVICE],
    updateStatus: [ROLES.OPERATIONS, ROLES.ADMIN],
    uploadDocuments: [ROLES.OPERATIONS, ROLES.ADMIN],
    trackPublic: ['*'] // Anyone can track with tracking number
  },
  users: {
    view: [ROLES.ADMIN],
    create: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN],
    invite: [ROLES.ADMIN],
    viewOwn: ['*'] // Everyone can view their own profile
  },
  messages: {
    view: [ROLES.CLIENT, ROLES.SALES, ROLES.PRICING, ROLES.OPERATIONS, ROLES.ADMIN, ROLES.CUSTOMER_SERVICE],
    create: [ROLES.CLIENT, ROLES.SALES, ROLES.PRICING, ROLES.OPERATIONS, ROLES.ADMIN, ROLES.CUSTOMER_SERVICE],
    viewInternal: [ROLES.SALES, ROLES.PRICING, ROLES.OPERATIONS, ROLES.ADMIN, ROLES.CUSTOMER_SERVICE],
    createInternal: [ROLES.SALES, ROLES.PRICING, ROLES.OPERATIONS, ROLES.ADMIN]
  },
  analytics: {
    view: [ROLES.ADMIN, ROLES.ANALYST],
    viewDepartment: [ROLES.SALES, ROLES.PRICING, ROLES.OPERATIONS, ROLES.ANALYST]
  },
  activityLog: {
    view: [ROLES.ADMIN, ROLES.ANALYST]
  },
  reporting: {
    view: [ROLES.ADMIN, ROLES.ANALYST],
  }
};

/**
 * Check if a user has permission for a specific action
 * @param {string} userRole - User's role (client, sales, pricing, operations, admin)
 * @param {string} module - Module name (rfqs, shipments, users, messages, analytics, activityLog)
 * @param {string} action - Action name (view, create, edit, delete, etc.)
 * @returns {boolean}
 */
export function hasPermission(userRole, module, action) {
  if (!userRole || !module || !action) return false;
  
  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) return false;
  
  const allowedRoles = modulePermissions[action];
  if (!allowedRoles) return false;
  
  // '*' means all roles have access
  if (allowedRoles.includes('*')) return true;
  
  return allowedRoles.includes(userRole);
}

/**
 * Check if user can access specific data (ownership check)
 * @param {string} userRole - User's role
 * @param {string} userEmail - User's email
 * @param {object} data - Data object to check
 * @param {string} module - Module name
 * @returns {boolean}
 */
export function canAccessData(userRole, userEmail, data, module) {
  if (!data || !userEmail) return false;
  
  // Admin can access everything
  if (userRole === ROLES.ADMIN) return true;
  
  // Staff and read-only roles can access all data in their modules
  if (module === 'rfqs' && hasPermission(userRole, 'rfqs', 'viewAll')) {
    return true;
  }
  if (module === 'shipments' && hasPermission(userRole, 'shipments', 'viewAll')) {
    return true;
  }
  
  // Analyst can access analytics but no transactional data
  if (userRole === ROLES.ANALYST) return false;
  
  // Clients can only access their own data
  if (userRole === ROLES.CLIENT) {
    return data.client_email === userEmail || data.created_by === userEmail;
  }
  
  return false;
}

/**
 * Filter messages based on user role (hide internal messages from clients)
 * @param {Array} messages - Array of messages
 * @param {string} userRole - User's role
 * @returns {Array} Filtered messages
 */
export function filterMessages(messages, userRole) {
  if (!messages || !Array.isArray(messages)) return [];
  
  // Staff can see all messages including internal
  if (hasPermission(userRole, 'messages', 'viewInternal')) {
    return messages;
  }
  
  // Clients can only see non-internal messages
  return messages.filter(msg => !msg.is_internal);
}

/**
 * Get user's department/role label
 * @param {string} role - User's role
 * @returns {string}
 */
export function getRoleLabel(role) {
  const labels = {
    client: 'Client',
    sales: 'Sales',
    pricing: 'Pricing',
    operations: 'Operations',
    admin: 'Admin',
    customer_service: 'Customer Service',
    analyst: 'Analyst',
  };
  return labels[role] || 'User';
}

/**
 * Get accessible navigation items based on role
 * @param {string} role - User's role
 * @returns {Array} Navigation items
 */
export function getAccessiblePages(role) {
  const pages = {
    client: ['ClientDashboard', 'ClientRFQs', 'ClientShipments'],
    sales: ['SalesDashboard', 'SalesRFQQueue'],
    pricing: ['PricingDashboard', 'PricingQueue'],
    operations: ['OperationsDashboard', 'OperationsShipments', 'CreateShipment'],
    admin: ['AdminDashboard', 'AdminRFQs', 'AdminShipments', 'AdminUsers', 'AdminActivity', 'AdminAnalytics'],
    customer_service: ['CustomerServiceDashboard', 'CustomerServiceRFQs', 'CustomerServiceShipments'],
    analyst: ['AnalystDashboard', 'AdminAnalytics', 'AdminReporting', 'AdminActivity'],
  };
  
  return pages[role] || pages.client;
}

export { ROLES, PERMISSIONS };