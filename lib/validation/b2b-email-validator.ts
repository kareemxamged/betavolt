/**
 * 🏛️ BetaVolt — B2B Corporate Email Validation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces strict enterprise quality assurance by ensuring inquiries and proposals
 * are submitted with authentic corporate or private domain addresses, rejecting
 * free public webmail providers (Gmail, Yahoo, Outlook, etc.) and disposable emails.
 */

export interface B2bEmailValidationResult {
  isValid: boolean;
  isCorporate: boolean;
  domain: string;
  errorType?: 'EMPTY' | 'INVALID_FORMAT' | 'FREE_EMAIL' | 'DISPOSABLE_EMAIL';
  message: string;
  messageEn: string;
  messageAr: string;
}

/**
 * Standard public/free personal webmail domains that are disallowed for B2B contracting.
 */
const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Google
  'gmail.com',
  'googlemail.com',

  // Microsoft Consumer
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.es',
  'hotmail.it',
  'outlook.com',
  'outlook.sa',
  'outlook.fr',
  'outlook.de',
  'outlook.es',
  'live.com',
  'live.co.uk',
  'live.fr',
  'live.de',
  'live.com.ar',
  'msn.com',
  'windowslive.com',
  'passport.com',

  // Yahoo
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.es',
  'yahoo.it',
  'yahoo.de',
  'yahoo.ca',
  'yahoo.com.au',
  'yahoo.com.br',
  'yahoo.com.mx',
  'yahoo.co.in',
  'yahoo.co.jp',
  'ymail.com',
  'rocketmail.com',

  // Apple
  'icloud.com',
  'me.com',
  'mac.com',

  // AOL / Verizon
  'aol.com',
  'aim.com',
  'netscape.net',

  // Proton / Privacy Webmails (consumer domains)
  'proton.me',
  'protonmail.com',
  'protonmail.ch',
  'pm.me',
  'tutanota.com',
  'tutanota.de',
  'tuta.io',
  'tuta.com',

  // Zoho Consumer Webmail (Note: business domains on Zoho are accepted, only @zoho.com is blocked)
  'zoho.com',
  'zohomail.com',

  // European / Global Free Webmail
  'gmx.com',
  'gmx.net',
  'gmx.de',
  'gmx.at',
  'gmx.ch',
  'web.de',
  'mail.com',
  'inbox.com',
  'fastmail.com',
  'hey.com',
  'yandex.com',
  'yandex.ru',
  'ya.ru',
  'mail.ru',
  'inbox.ru',
  'list.ru',
  'bk.ru',
  'rambler.ru',
  'rediffmail.com',
  'lycos.com',
]);

/**
 * Common disposable / temporary email domains.
 */
const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'dispostable.com',
  'getairmail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'mohmal.com',
  'fakemailgenerator.com',
  'burnermail.io',
  'generator.email',
  'tempail.com',
  'crazymailing.com',
]);

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates whether an email is a legitimate corporate / business email.
 * Rejects free consumer webmail (Gmail, Yahoo, Outlook, etc.) and disposable addresses.
 */
export function validateB2bEmail(
  rawEmail: string | undefined | null,
  locale: 'ar' | 'en' = 'ar'
): B2bEmailValidationResult {
  const email = (rawEmail || '').trim().toLowerCase();

  // 1. Check empty
  if (!email) {
    const messageAr = 'يرجى إدخال البريد الإلكتروني الخاص بجهة العمل.';
    const messageEn = 'Please enter your corporate email address.';
    return {
      isValid: false,
      isCorporate: false,
      domain: '',
      errorType: 'EMPTY',
      message: locale === 'ar' ? messageAr : messageEn,
      messageEn,
      messageAr,
    };
  }

  // 2. Syntax validation
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    const messageAr = 'صيغة البريد الإلكتروني غير صالحة. يرجى التأكد من كتابة البريد بشكل صحيح (مثال: name@company.com).';
    const messageEn = 'Invalid email format. Please check your email spelling (e.g. name@company.com).';
    return {
      isValid: false,
      isCorporate: false,
      domain: '',
      errorType: 'INVALID_FORMAT',
      message: locale === 'ar' ? messageAr : messageEn,
      messageEn,
      messageAr,
    };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    const messageAr = 'صيغة البريد الإلكتروني غير صحيحة.';
    const messageEn = 'Invalid email address.';
    return {
      isValid: false,
      isCorporate: false,
      domain: '',
      errorType: 'INVALID_FORMAT',
      message: locale === 'ar' ? messageAr : messageEn,
      messageEn,
      messageAr,
    };
  }

  const domain = parts[1].toLowerCase();

  // 3. Check disposable temporary emails
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    const messageAr = 'عناوين البريد الإلكتروني المؤقتة غير مقبولة. يرجى استخدام البريد الرسمي لشركتك أو مؤسستك.';
    const messageEn = 'Temporary/disposable email addresses are not accepted. Please provide your official company email.';
    return {
      isValid: false,
      isCorporate: false,
      domain,
      errorType: 'DISPOSABLE_EMAIL',
      message: locale === 'ar' ? messageAr : messageEn,
      messageEn,
      messageAr,
    };
  }

  // 4. Check free / public personal email domains
  if (FREE_EMAIL_DOMAINS.has(domain)) {
    const messageAr =
      'يرجى استخدام البريد الإلكتروني الرسمي الخاص بشركتك أو جهة عملك (مثال: name@company.com). لا يُقبل البريد الشخصي المجاني (مثل Gmail أو Yahoo أو Outlook) لضمان سرعة معالجة وتأهيل طلبات المشاريع والتعاقدات المؤسسية.';
    const messageEn =
      'Please provide your official corporate or business email address (e.g. name@company.com). Free personal webmail (such as Gmail, Yahoo, or Outlook) is not accepted to ensure expedited qualification for enterprise B2B inquiries.';
    return {
      isValid: false,
      isCorporate: false,
      domain,
      errorType: 'FREE_EMAIL',
      message: locale === 'ar' ? messageAr : messageEn,
      messageEn,
      messageAr,
    };
  }

  // 5. Valid corporate email
  return {
    isValid: true,
    isCorporate: true,
    domain,
    message: '',
    messageEn: '',
    messageAr: '',
  };
}
