import { base44 } from '@/api/base44Client';

const statusLabels = {
  // RFQ statuses
  submitted: 'Submitted',
  sales_review: 'Under Sales Review',
  pricing_in_progress: 'Pricing In Progress',
  quotation_ready: 'Quotation Ready',
  sent_to_client: 'Sent to Client',
  client_confirmed: 'Client Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  won: 'Won',
  lost: 'Lost',
  // Shipment statuses
  booking_confirmed: 'Booking Confirmed',
  cargo_received: 'Cargo Received',
  customs_export: 'In Export Customs',
  departed_origin: 'Departed from Origin',
  in_transit: 'In Transit',
  arrived_destination: 'Arrived at Destination',
  customs_clearance: 'In Customs Clearance',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export async function sendStatusNotification(entityType, entity, oldStatus, newStatus) {
  try {
    const clientEmail = entity.client_email || entity.email;
    if (!clientEmail) return;

    // Get user preferences
    const prefs = await base44.entities.NotificationPreferences.filter({ user_email: clientEmail });
    const userPref = prefs[0];

    // Check if user wants this type of notification
    if (entityType === 'rfq' && userPref && !userPref.rfq_status_updates) return;
    if (entityType === 'shipment' && userPref && !userPref.shipment_status_updates) return;

    const refNumber = entity.reference_number || entity.tracking_number;
    const subject = `${entityType === 'rfq' ? 'RFQ' : 'Shipment'} Status Update - ${refNumber}`;
    const body = `
Dear ${entity.contact_person || entity.company_name},

Your ${entityType === 'rfq' ? 'RFQ' : 'shipment'} ${refNumber} status has been updated:

Previous Status: ${statusLabels[oldStatus] || oldStatus}
New Status: ${statusLabels[newStatus] || newStatus}

${entityType === 'rfq' ? `
Route: ${entity.origin} → ${entity.destination}
Mode: ${entity.mode?.toUpperCase()}
` : `
Route: ${entity.origin} → ${entity.destination}
${entity.eta ? `ETA: ${entity.eta}` : ''}
`}

You can view more details by logging into your portal at ${window.location.origin}/Portal

Best regards,
Tact Freight Team
    `;

    // Send email notification
    if (!userPref || userPref.notification_method === 'email' || userPref.notification_method === 'both') {
      await base44.integrations.Core.SendEmail({
        to: clientEmail,
        subject: subject,
        body: body,
      });
    }

    // Create in-app notification
    await base44.entities.Notification.create({
      type: entityType === 'rfq' ? 'rfq_assigned' : 'shipment_update',
      title: `${entityType === 'rfq' ? 'RFQ' : 'Shipment'} Status Updated`,
      message: `${refNumber} status changed to ${statusLabels[newStatus] || newStatus}`,
      recipient_email: clientEmail,
      entity_type: entityType,
      entity_id: entity.id,
      entity_reference: refNumber,
      action_url: `/${entityType === 'rfq' ? 'ClientRFQs' : 'ClientShipments'}`,
    });

  } catch (error) {
    console.error('Error sending status notification:', error);
  }
}

export async function sendQuotationNotification(rfq) {
  try {
    const clientEmail = rfq.client_email || rfq.email;
    if (!clientEmail) return;

    const prefs = await base44.entities.NotificationPreferences.filter({ user_email: clientEmail });
    const userPref = prefs[0];

    if (userPref && !userPref.quotation_received) return;

    const subject = `Quotation Ready - ${rfq.reference_number}`;
    const body = `
Dear ${rfq.contact_person},

Your quotation for RFQ ${rfq.reference_number} is now ready!

Route: ${rfq.origin} → ${rfq.destination}
Mode: ${rfq.mode?.toUpperCase()}
${rfq.quotation_amount ? `Amount: ${rfq.quotation_currency} ${rfq.quotation_amount}` : ''}

Please log in to your portal to view and download the quotation: ${window.location.origin}/Portal

Best regards,
Tact Freight Team
    `;

    if (!userPref || userPref.notification_method === 'email' || userPref.notification_method === 'both') {
      await base44.integrations.Core.SendEmail({
        to: clientEmail,
        subject: subject,
        body: body,
      });
    }

    await base44.entities.Notification.create({
      type: 'rfq_assigned',
      title: 'Quotation Ready',
      message: `Your quotation for ${rfq.reference_number} is ready to view`,
      recipient_email: clientEmail,
      entity_type: 'rfq',
      entity_id: rfq.id,
      entity_reference: rfq.reference_number,
      action_url: '/ClientRFQs',
    });

  } catch (error) {
    console.error('Error sending quotation notification:', error);
  }
}