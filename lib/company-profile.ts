import { readFileSync } from 'fs';
import { join } from 'path';
import { getContent } from '@/lib/content-store';
import {
  CompanyProfile,
  DEFAULT_COMPANY_PROFILE,
} from './company-profile-types';

export * from './company-profile-types';

const detailsPath = join(process.cwd(), 'data', 'contact-details.json');

function readLocalFallback(): Partial<CompanyProfile> {
  try {
    return JSON.parse(readFileSync(detailsPath, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Retrieves the live company profile from Supabase site_content,
 * falling back gracefully to local JSON and static defaults.
 */
export async function getCompanyProfile(): Promise<CompanyProfile> {
  try {
    const db = await getContent('contact-details');
    if (db && typeof db === 'object') {
      return {
        ...DEFAULT_COMPANY_PROFILE,
        ...readLocalFallback(),
        ...(db as Record<string, unknown>),
      } as CompanyProfile;
    }
  } catch (err) {
    console.warn('[CompanyProfile] Failed to fetch from DB, using fallback:', err);
  }

  return {
    ...DEFAULT_COMPANY_PROFILE,
    ...readLocalFallback(),
  };
}
