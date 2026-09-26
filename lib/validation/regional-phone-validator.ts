/**
 * 🏛️ BetaVolt — Regional Phone & Anti-Dummy Validation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Exclusively supports the 6 GCC states (Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman)
 * and the Arab Republic of Egypt. Proactively rejects dummy, random, sequential,
 * or fake phone numbers, guaranteeing authentic B2B communication.
 */

export type SupportedCountryCode = 'SA' | 'AE' | 'KW' | 'QA' | 'BH' | 'OM' | 'EG';

export interface CountryInfo {
  code: SupportedCountryCode;
  dialCode: string; // e.g. "+966"
  dialDigits: string; // e.g. "966"
  nameAr: string;
  nameEn: string;
  flag: string;
  placeholder: string;
  nationalLengths: number[]; // valid national lengths (excluding international dial code)
}

export const SUPPORTED_COUNTRIES: Record<SupportedCountryCode, CountryInfo> = {
  SA: {
    code: 'SA',
    dialCode: '+966',
    dialDigits: '966',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    placeholder: '05X XXX XXXX',
    nationalLengths: [9, 10], // 5XXXXXXXX (9) or 05XXXXXXXX (10)
  },
  AE: {
    code: 'AE',
    dialCode: '+971',
    dialDigits: '971',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    placeholder: '05X XXX XXXX',
    nationalLengths: [9, 10], // 5XXXXXXXX (9) or 05XXXXXXXX (10)
  },
  KW: {
    code: 'KW',
    dialCode: '+965',
    dialDigits: '965',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    placeholder: 'XXXX XXXX',
    nationalLengths: [8], // 8 digits
  },
  QA: {
    code: 'QA',
    dialCode: '+974',
    dialDigits: '974',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    placeholder: 'XXXX XXXX',
    nationalLengths: [8], // 8 digits
  },
  BH: {
    code: 'BH',
    dialCode: '+973',
    dialDigits: '973',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    flag: '🇧🇭',
    placeholder: 'XXXX XXXX',
    nationalLengths: [8], // 8 digits
  },
  OM: {
    code: 'OM',
    dialCode: '+968',
    dialDigits: '968',
    nameAr: 'سلطنة عمان',
    nameEn: 'Oman',
    flag: '🇴🇲',
    placeholder: 'XXXX XXXX',
    nationalLengths: [8], // 8 digits
  },
  EG: {
    code: 'EG',
    dialCode: '+20',
    dialDigits: '20',
    nameAr: 'جمهورية مصر العربية',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    placeholder: '01X XXXX XXXX',
    nationalLengths: [10, 11], // 10XXXXXXXX (10) or 010XXXXXXXX (11)
  },
};

export const SUPPORTED_COUNTRIES_LIST: CountryInfo[] = [
  SUPPORTED_COUNTRIES.SA,
  SUPPORTED_COUNTRIES.AE,
  SUPPORTED_COUNTRIES.KW,
  SUPPORTED_COUNTRIES.QA,
  SUPPORTED_COUNTRIES.BH,
  SUPPORTED_COUNTRIES.OM,
  SUPPORTED_COUNTRIES.EG,
];

export interface RegionalPhoneValidationResult {
  isValid: boolean;
  country?: SupportedCountryCode;
  countryInfo?: CountryInfo;
  formattedE164?: string; // e.g. "+966580178629"
  nationalNumber?: string; // e.g. "580178629"
  errorType?: 'EMPTY' | 'UNSUPPORTED_COUNTRY' | 'INVALID_FORMAT' | 'DUMMY_NUMBER' | 'INVALID_LENGTH';
  message: string;
  messageAr: string;
  messageEn: string;
}

/**
 * Checks if a string of digits is a fraudulent or dummy pattern.
 */
function isDummyPattern(digits: string): boolean {
  if (!digits || digits.length < 5) return true;

  // 1. Extreme repetitive uniformity: only 1 or 2 distinct digits throughout the entire number
  const uniqueDigits = new Set(digits.split(''));
  if (uniqueDigits.size <= 2 && digits.length >= 7) {
    return true; // e.g. 0500000000, 0555555555, 111111111, 0505050505
  }

  // 2. More than 5 consecutive identical digits anywhere in the number
  if (/(\d)\1{5,}/.test(digits)) {
    return true; // e.g. 50000001, 129999993
  }

  // 3. Sequential ascending digits (length >= 5)
  const ascendingPatterns = [
    '012345', '123456', '234567', '345678', '456789', '567890',
  ];
  if (ascendingPatterns.some(p => digits.includes(p))) {
    return true;
  }

  // 4. Sequential descending digits (length >= 5)
  const descendingPatterns = [
    '987654', '876543', '765432', '654321', '543210',
  ];
  if (descendingPatterns.some(p => digits.includes(p))) {
    return true;
  }

  // 5. Alternating repeating 2-digit pairs (3 or more repeats)
  if (/^(\d{2})\1{2,}$/.test(digits)) {
    return true; // e.g. 121212, 505050
  }

  // 6. Repeating 3-digit groups (3 or more repeats)
  if (/^(\d{3})\1{2,}$/.test(digits)) {
    return true; // e.g. 123123123
  }

  return false;
}

/**
 * Validates a national number against official telecom rules for the designated country.
 */
function validateCountryNationalNumber(
  country: SupportedCountryCode,
  national: string
): { isValid: boolean; normalizedNational: string; errorReason?: 'FORMAT' | 'DUMMY' | 'LENGTH' } {
  // Strip any leading trunk 0 for standard checks
  const clean = national.replace(/^0+/, '');

  if (isDummyPattern(national) || isDummyPattern(clean)) {
    return { isValid: false, normalizedNational: clean, errorReason: 'DUMMY' };
  }

  switch (country) {
    case 'SA': {
      // Saudi Arabia: Mobile starts with 5 (9 digits: 5XXXXXXXX), Landline starts with 11-17 (9 digits: 1[1-7]XXXXXXX)
      // If user provided leading 0, national was 10 digits: 05XXXXXXXX or 01XXXXXXXX
      if (!/^(5\d{8}|1[1-7]\d{7})$/.test(clean)) {
        return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
      }
      return { isValid: true, normalizedNational: clean };
    }

    case 'AE': {
      // UAE: Mobile starts with 50, 52, 54, 55, 56, 58 (9 digits: 5XXXXXXXX). Landline: 2, 3, 4, 6, 7, 9 (8-9 digits)
      if (!/^(5[024568]\d{7}|[234679]\d{7})$/.test(clean)) {
        return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
      }
      return { isValid: true, normalizedNational: clean };
    }

    case 'KW': {
      // Kuwait: 8 digits. Mobile starts with 5, 6, 9. Landline starts with 2.
      if (!/^[5692]\d{7}$/.test(clean)) {
        return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
      }
      return { isValid: true, normalizedNational: clean };
    }

    case 'QA': {
      // Qatar: 8 digits. Mobile starts with 3, 5, 6, 7. Landline starts with 4.
      if (!/^[35674]\d{7}$/.test(clean)) {
        return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
      }
      return { isValid: true, normalizedNational: clean };
    }

    case 'BH': {
      // Bahrain: 8 digits. Mobile starts with 3, 6. Landline starts with 1, 7.
      if (!/^[3617]\d{7}$/.test(clean)) {
        return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
      }
      return { isValid: true, normalizedNational: clean };
    }

    case 'OM': {
      // Oman: 8 digits. Mobile starts with 7, 9. Landline starts with 2.
      if (!/^[792]\d{7}$/.test(clean)) {
        return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
      }
      return { isValid: true, normalizedNational: clean };
    }

    case 'EG': {
      // Egypt: Mobile starts with 10, 11, 12, 15 (10 digits: 1[0125]XXXXXXXX). Landline starts with 2, 3 (8-9 digits).
      if (!/^(1[0125]\d{8}|[23]\d{7,8})$/.test(clean)) {
        return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
      }
      return { isValid: true, normalizedNational: clean };
    }

    default:
      return { isValid: false, normalizedNational: clean, errorReason: 'FORMAT' };
  }
}

/**
 * Universal regional phone validator.
 * Accepts input with or without country code, extracts country, evaluates telecom format,
 * runs anti-dummy heuristics, and outputs standardized E.164.
 *
 * @param rawPhone The raw input string
 * @param selectedCountry Optional country hint (e.g. selected in UI dropdown). Defaults to 'SA'.
 * @param locale Language for error messages ('ar' or 'en'). Defaults to 'ar'.
 */
export function validateRegionalPhone(
  rawPhone: string | null | undefined,
  selectedCountry: SupportedCountryCode = 'SA',
  locale: 'ar' | 'en' = 'ar'
): RegionalPhoneValidationResult {
  const isAr = locale === 'ar';

  if (!rawPhone || !rawPhone.trim()) {
    const messageAr = 'يرجى إدخال رقم هاتف فعال للتواصل الفني والتأكيد.';
    const messageEn = 'Please enter an active phone number for technical contact.';
    return {
      isValid: false,
      errorType: 'EMPTY',
      message: isAr ? messageAr : messageEn,
      messageAr,
      messageEn,
    };
  }

  const raw = rawPhone.trim();
  const digitsOnly = raw.replace(/\D/g, '');

  if (!digitsOnly || digitsOnly.length < 7) {
    const messageAr = 'رقم الهاتف قصير جداً أو غير مكتمل.';
    const messageEn = 'Phone number is too short or incomplete.';
    return {
      isValid: false,
      errorType: 'INVALID_LENGTH',
      message: isAr ? messageAr : messageEn,
      messageAr,
      messageEn,
    };
  }

  // 1. Detect if an explicit international dial code is present
  let detectedCountry: SupportedCountryCode = selectedCountry;
  let nationalDigits = digitsOnly;

  // Check for foreign country codes outside GCC & Egypt first (e.g. +1, +44, +91, +90, +92, +962, etc.)
  const normalizedRaw = raw.replace(/^(00|\+)/, '');

  // Match known supported dial digits
  const matchedSupported = SUPPORTED_COUNTRIES_LIST.find(c => {
    // If input starts with dialDigits (e.g. 9665XXXXXXXX, 2010XXXXXXXX)
    if (normalizedRaw.startsWith(c.dialDigits) && normalizedRaw.length > c.dialDigits.length + 6) {
      return true;
    }
    return false;
  });

  if (matchedSupported) {
    detectedCountry = matchedSupported.code;
    nationalDigits = normalizedRaw.slice(matchedSupported.dialDigits.length);
  } else {
    // Check if the user entered another foreign country code with + or 00
    if (raw.startsWith('+') || raw.startsWith('00')) {
      const messageAr = 'عذراً، نقبل فقط أرقام الهواتف التابعة للمملكة العربية السعودية، دول الخليج العربي، ومصر.';
      const messageEn = 'We only accept phone numbers from Saudi Arabia, GCC countries, and Egypt.';
      return {
        isValid: false,
        errorType: 'UNSUPPORTED_COUNTRY',
        message: isAr ? messageAr : messageEn,
        messageAr,
        messageEn,
      };
    }

    // Auto-detect based on local prefixes if no country code provided
    if (digitsOnly.startsWith('010') || digitsOnly.startsWith('011') || digitsOnly.startsWith('012') || digitsOnly.startsWith('015')) {
      if (digitsOnly.length === 11) {
        detectedCountry = 'EG';
      }
    } else if (digitsOnly.startsWith('05') && digitsOnly.length === 10) {
      // 05 could be SA or AE; if selectedCountry is AE keep AE, otherwise default to SA
      if (selectedCountry !== 'AE') {
        detectedCountry = 'SA';
      }
    }
  }

  const countryInfo = SUPPORTED_COUNTRIES[detectedCountry];

  // 2. Validate National Number
  const nationalCheck = validateCountryNationalNumber(detectedCountry, nationalDigits);

  if (!nationalCheck.isValid) {
    if (nationalCheck.errorReason === 'DUMMY') {
      const messageAr = 'رقم الهاتف يبدو غير صحيح أو عشوائي. يرجى إدخال رقم هاتف حقيقي فعال.';
      const messageEn = 'The phone number appears random or invalid. Please enter a real, active phone number.';
      return {
        isValid: false,
        country: detectedCountry,
        countryInfo,
        errorType: 'DUMMY_NUMBER',
        message: isAr ? messageAr : messageEn,
        messageAr,
        messageEn,
      };
    }

    const messageAr = `رقم الهاتف غير مطابق لتنسيق أرقام ${countryInfo.nameAr}. مثال: ${countryInfo.placeholder}`;
    const messageEn = `Invalid phone format for ${countryInfo.nameEn}. Example: ${countryInfo.placeholder}`;
    return {
      isValid: false,
      country: detectedCountry,
      countryInfo,
      errorType: 'INVALID_FORMAT',
      message: isAr ? messageAr : messageEn,
      messageAr,
      messageEn,
    };
  }

  // 3. Format into standardized E.164 (+<dialCode><nationalDigitsWithoutLeadingZero>)
  const formattedE164 = `${countryInfo.dialCode}${nationalCheck.normalizedNational}`;

  return {
    isValid: true,
    country: detectedCountry,
    countryInfo,
    formattedE164,
    nationalNumber: nationalCheck.normalizedNational,
    message: isAr ? 'رقم الهاتف معتمد وصحيح' : 'Valid regional phone number',
    messageAr: 'رقم الهاتف معتمد وصحيح',
    messageEn: 'Valid regional phone number',
  };
}

/**
 * Formats a phone number cleanly for presentation.
 */
export function formatRegionalPhoneDisplay(e164: string): string {
  if (!e164) return '';
  return e164;
}
