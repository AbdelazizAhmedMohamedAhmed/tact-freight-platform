import { base44 } from '@/api/base44Client';

/**
 * Send notification to users
 * @param {Object} params
 * @param {string} params.type - notification type
 * @param {string} params.title - notification title
 * @param {string} params.message - notification message
 * @param {string[]} params.recipients - array of email addresses
 * @param {string} params.entity_type - rfq, shipment, etc.
 * @param {string} params.entity_id - entity id
 * @param {string} params.entity_reference - RFQ-XXX, TF-XXX, etc.
 * @param {string} params.action_url - optional action URL
 */
export async function sendNotification({
  type,
  title,
  message,
  recipients,
  entity_type,
  entity_id,
  entity_reference,
  action_url,
}) {
  if (!recipients || recipients.length === 0) return;

  for (const email of recipients) {
    try {
      await base44.entities.Notification.create({
        type,
        title,
        message,
        recipient_email: email,
        entity_type,
        entity_id,
        entity_reference,
        action_url,
        is_read: false,
      });

      // Send email notification if user has it enabled
      await sendEmailNotification({
        to: email,
        subject: title,
        body: message,
        reference: entity_reference,
      });
    } catch (err) {
      console.error(`Failed to send notification to ${email}:`, err);
    }
  }
}

/**
 * Send email notification
 */
export async function sendEmailNotification({ to, subject, body, reference }) {
  try {
    await base44.integrations.Core.SendEmail({
      to,
      subject: `[${reference || 'Tact Freight'}] ${subject}`,
      body: `
        <h2>${subject}</h2>
        <p>${body}</p>
        ${reference ? `<p style="margin-top: 20px; font-family: monospace; color: #D50000; font-weight: bold;">${reference}</p>` : ''}
        <p style="margin-top: 20px; font-size: 12px; color: #999;">
          View details in your Tact Freight portal
        </p>
      `,
      from_name: 'Tact Freight',
    });
  } catch (err) {
    console.error('Failed to send email notification:', err);
  }
}

/**
 * Notification triggers
 */

export async function notifyRFQCreated(rfq) {
  const sales = await findUsersByRole('sales');
  
  await sendNotification({
    type: 'rfq_created',
    title: 'New RFQ Received',
    message: `New quote request from ${rfq.company_name}`,
    recipients: sales.map(u => u.email),
    entity_type: 'rfq',
    entity_id: rfq.id,
    entity_reference: rfq.reference_number,
  });
}

export async function notifyRFQSentToPricing(rfq, pricing_email) {
  await sendNotification({
    type: 'rfq_assigned',
    title: 'RFQ Assigned to You',
    message: `Quote request ${rfq.reference_number} from ${rfq.company_name} needs pricing`,
    recipients: [pricing_email],
    entity_type: 'rfq',
    entity_id: rfq.id,
    entity_reference: rfq.reference_number,
  });
}

export async function notifyPricingComplete(rfq, sales_email) {
  await sendNotification({
    type: 'rfq_assigned',
    title: 'Pricing Complete',
    message: `Pricing for ${rfq.reference_number} is ready for quotation`,
    recipients: [sales_email],
    entity_type: 'rfq',
    entity_id: rfq.id,
    entity_reference: rfq.reference_number,
  });
}

export async function notifyQuotationSent(rfq) {
  await sendNotification({
    type: 'quotation_received',
    title: 'Your Quotation is Ready',
    message: `We've prepared a quotation for your shipment request`,
    recipients: [rfq.client_email],
    entity_type: 'rfq',
    entity_id: rfq.id,
    entity_reference: rfq.reference_number,
  });
}

export async function notifyQuotationConfirmed(rfq, sales_email) {
  await sendNotification({
    type: 'rfq_assigned',
    title: 'Quotation Confirmed',
    message: `Client ${rfq.company_name} has confirmed quotation for ${rfq.reference_number}`,
    recipients: [sales_email],
    entity_type: 'rfq',
    entity_id: rfq.id,
    entity_reference: rfq.reference_number,
  });
}

export async function notifyShipmentAssigned(shipment, operations_email) {
  await sendNotification({
    type: 'shipment_update',
    title: 'New Shipment Assigned',
    message: `Shipment ${shipment.tracking_number} assigned to you for operations`,
    recipients: [operations_email],
    entity_type: 'shipment',
    entity_id: shipment.id,
    entity_reference: shipment.tracking_number,
  });
}

export async function notifyShipmentStatusUpdate(shipment, status) {
  const client = shipment.client_email;
  const sales = await findUsersByRole('sales');
  const operations = await findUsersByRole('operations');

  const statusLabels = {
    booking_confirmed: 'Booking Confirmed',
    cargo_received: 'Cargo Received',
    export_clearance: 'Export Clearance Obtained',
    departed_origin: 'Departed from Origin',
    in_transit: 'In Transit',
    arrived_destination: 'Arrived at Destination',
    customs_clearance: 'Customs Clearance Obtained',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
  };

  const message = `Shipment ${shipment.tracking_number} status: ${statusLabels[status] || status}`;
  const recipients = [client, ...sales.map(u => u.email), ...operations.map(u => u.email)];

  await sendNotification({
    type: 'shipment_update',
    title: 'Shipment Status Update',
    message,
    recipients: Array.from(new Set(recipients)),
    entity_type: 'shipment',
    entity_id: shipment.id,
    entity_reference: shipment.tracking_number,
  });
}

// Helper function
async function findUsersByRole(role) {
  try {
    const users = await base44.entities.User.filter({ department: role }, '-created_date', 100);
    return users;
  } catch {
    return [];
  }
}