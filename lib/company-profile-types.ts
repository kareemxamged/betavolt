/**
 * 🏛️ BetaVolt — Shared Company Profile Schema & Definitions
 * ─────────────────────────────────────────────────────────────────────────────
 * Browser-safe definitions and types for company headquarters, locations,
 * inboxes, and telecommunications. Safe to import in both client & server components.
 */

export interface CompanyProfile {
  // Official Corporate Inboxes
  email_general: string;      // info@betavolt.com.sa (General inquiries)
  email_projects: string;     // engineering@betavolt.com.sa (Technical projects)
  email_careers: string;      // careers@betavolt.com.sa (HR & Talent)
  email_sales: string;        // sales@betavolt.com.sa (Commercial & RFPs)
  email_inquiries: string;    // inquiries@betavolt.com.sa (Official intake & confirmation)

  // Telephony & Instant Messaging
  phone: string;              // +966 58 017 8629
  whatsapp: string;           // +966 58 017 8629

  // Headquarters & Physical Presence (Bilingual)
  city_ar: string;            // الدمام
  city_en: string;            // Dammam
  address_ar: string;         // المدينة الصناعية الثانية، راديسون بلو، مدن، الدمام، EIGA7420
  address_en: string;         // 2nd industrial city, Radisson Blu, MODON, Dammam, EIGA7420
  working_hours_ar: string;   // الأحد – الخميس  |  08:00 ص – 05:00 م
  working_hours_en: string;   // Sunday – Thursday  |  08:00 AM – 05:00 PM

  // Automated Alert Routing Targets (Comma-delimited or individual emails)
  alert_target_rfp?: string;         // Default: inquiries@betavolt.com.sa
  alert_target_contact?: string;     // Default: inquiries@betavolt.com.sa
  alert_target_lead_magnet?: string; // Default: sales@betavolt.com.sa
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  email_general: 'info@betavolt.com.sa',
  email_projects: 'engineering@betavolt.com.sa',
  email_careers: 'careers@betavolt.com.sa',
  email_sales: 'sales@betavolt.com.sa',
  email_inquiries: 'inquiries@betavolt.com.sa',
  phone: '+966 58 017 8629',
  whatsapp: '+966 58 017 8629',
  city_ar: 'الدمام',
  city_en: 'Dammam',
  address_ar: 'المدينة الصناعية الثانية، راديسون بلو، مدن، الدمام، EIGA7420',
  address_en: '2nd industrial city, Radisson Blu, MODON, Dammam, EIGA7420',
  working_hours_ar: 'الأحد – الخميس  |  08:00 ص – 05:00 م',
  working_hours_en: 'Sunday – Thursday  |  08:00 AM – 05:00 PM',
  alert_target_rfp: 'inquiries@betavolt.com.sa',
  alert_target_contact: 'inquiries@betavolt.com.sa',
  alert_target_lead_magnet: 'sales@betavolt.com.sa',
};

/**
 * Normalizes any Saudi or international phone number into a direct WhatsApp click-to-chat URL.
 */
export function formatWhatsAppUrl(rawPhone?: string | null): string {
  const digits = (rawPhone || DEFAULT_COMPANY_PROFILE.whatsapp).replace(/\D/g, '');
  if (!digits) return `https://wa.me/966580178629`;

  let normalized = digits;
  if (normalized.startsWith('00966')) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith('05')) {
    normalized = '966' + normalized.slice(1);
  } else if (normalized.startsWith('5') && normalized.length === 9) {
    normalized = '966' + normalized;
  }

  return `https://wa.me/${normalized}`;
}

/**
 * Normalizes a phone number for HTML `tel:` links.
 */
export function formatTelUrl(rawPhone?: string | null): string {
  const clean = (rawPhone || DEFAULT_COMPANY_PROFILE.phone).replace(/[^\d+]/g, '');
  return clean ? `tel:${clean}` : `tel:+966580178629`;
}
