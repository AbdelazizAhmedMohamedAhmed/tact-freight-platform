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
 * Resolve or create a company based on company name and user email.
 * Returns company ID.
 */
export async function resolveOrCreateCompany({ company_name, email, industry, country, city, phone }) {
  // Check if a company with this name already exists
  const existingCompanies = await base44.entities.ClientCompany.filter({ name: company_name });

  if (existingCompanies.length > 0) {
    const company = existingCompanies[0];

    // Add user to member_emails if not already there
    const memberEmails = company.member_emails || [];
    if (!memberEmails.includes(email)) {
      await base44.entities.ClientCompany.update(company.id, {
        member_emails: [...memberEmails, email],
      });
    }

    return company.id;
  }

  // Create new company
  const newCompany = await base44.entities.ClientCompany.create({
    name: company_name,
    industry,
    country,
    city,
    phone,
    primary_contact_email: email,
    member_emails: [email],
  });

  return newCompany.id;
}

/**
 * Get all RFQs for a company.
 */
export async function getCompanyRFQs(companyId) {
  return base44.entities.RFQ.filter({ company_id: companyId }, '-created_date', 200);
}

/**
 * Get all shipments for a company.
 */
export async function getCompanyShipments(companyId) {
  return base44.entities.Shipment.filter({ company_id: companyId }, '-updated_date', 200);
}