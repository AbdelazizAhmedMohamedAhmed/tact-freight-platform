import { base44 } from '@/api/base44Client';

/**
 * Get or create a ClientCompany for the current user.
 * Returns { company, user }
 */
export async function resolveUserCompany(user) {
  if (!user) return { company: null, user };

  // Already linked
  if (user.company_id) {
    const results = await base44.entities.ClientCompany.filter({ id: user.company_id }, '', 1);
    if (results[0]) return { company: results[0], user };
  }

  return { company: null, user };
}

/**
 * Create a new company and link it to the user.
 * Also adds the user's email to member_emails.
 */
export async function createAndLinkCompany(user, companyData) {
  const company = await base44.entities.ClientCompany.create({
    ...companyData,
    primary_contact_email: user.email,
    member_emails: [user.email],
  });
  await base44.auth.updateMe({ company_id: company.id });
  return company;
}

/**
 * Get all shipments & RFQs for a company (all members).
 * Pass member_emails array.
 */
export async function getCompanyRFQs(companyId) {
  return base44.entities.RFQ.filter({ company_id: companyId }, '-created_date', 200);
}

export async function getCompanyShipments(companyId) {
  return base44.entities.Shipment.filter({ company_id: companyId }, '-updated_date', 200);
}