import { base44 } from '@/api/base44Client';

/**
 * Centralized activity logging utility
 * Use this to log all user actions across the app
 */

export const logActivity = async ({
  action,
  actionType,
  entityType,
  entityId = null,
  entityReference = null,
  details = null,
  metadata = {}
}) => {
  try {
    const user = await base44.auth.me().catch(() => null);
    
    await base44.entities.ActivityLog.create({
      action,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      entity_reference: entityReference,
      details,
      performed_by: user?.email || 'system',
      performed_by_name: user?.full_name || 'System',
      performed_by_role: user?.role || 'system',
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Specific logging helpers
export const logRFQAction = async (rfq, actionType, details, metadata = {}) => {
  await logActivity({
    action: details || `RFQ ${actionType.replace('rfq_', '').replace('_', ' ')}`,
    actionType,
    entityType: 'rfq',
    entityId: rfq.id,
    entityReference: rfq.reference_number,
    details,
    metadata
  });
};

export const logAssignment = async (rfq, assignmentType, assignedTo, assignedToName) => {
  await logActivity({
    action: `RFQ ${rfq.reference_number} assigned to ${assignedToName}`,
    actionType: 'rfq_assigned',
    entityType: 'rfq',
    entityId: rfq.id,
    entityReference: rfq.reference_number,
    details: `Assigned to ${assignmentType} team member: ${assignedToName} (${assignedTo})`,
    metadata: { assignment_type: assignmentType, assigned_to: assignedTo }
  });
};

export const logShipmentAction = async (shipment, actionType, details, metadata = {}) => {
  await logActivity({
    action: details || `Shipment ${actionType.replace('shipment_', '').replace('_', ' ')}`,
    actionType,
    entityType: 'shipment',
    entityId: shipment.id,
    entityReference: shipment.tracking_number,
    details,
    metadata
  });
};

export const logUserAction = async (user, actionType, details, metadata = {}) => {
  await logActivity({
    action: details || `User ${actionType.replace('user_', '').replace('_', ' ')}`,
    actionType,
    entityType: 'user',
    entityId: user.id,
    entityReference: user.email,
    details,
    metadata
  });
};

export const logAuthAction = async (actionType, details) => {
  await logActivity({
    action: details || actionType.replace('_', ' '),
    actionType,
    entityType: 'auth',
    details
  });
};

export const logFileAction = async (actionType, fileName, entityType, entityId, details) => {
  await logActivity({
    action: details || `File ${actionType.replace('file_', '')}`,
    actionType,
    entityType: 'file',
    entityId,
    details,
    metadata: { file_name: fileName }
  });
};