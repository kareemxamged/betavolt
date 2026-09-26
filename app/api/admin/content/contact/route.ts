import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getContent, setContent } from '@/lib/content-store';
import { CompanyProfile, getCompanyProfile } from '@/lib/company-profile';

const messagesDir = join(process.cwd(), 'messages');
const detailsPath = join(process.cwd(), 'data', 'contact-details.json');

function staticMessages(locale: 'en' | 'ar') {
  return JSON.parse(readFileSync(join(messagesDir, `${locale}.json`), 'utf-8'));
}

async function getMessages(locale: 'en' | 'ar'): Promise<Record<string, unknown>> {
  return (await getContent(`messages.${locale}`)) ?? staticMessages(locale);
}

export async function GET() {
  try {
    const [en, ar, details] = await Promise.all([
      getMessages('en'),
      getMessages('ar'),
      getCompanyProfile(),
    ]);

    return NextResponse.json({
      pageContent: {
        en: en.contact_page as Record<string, string>,
        ar: ar.contact_page as Record<string, string>,
      },
      details,
    });
  } catch (err) {
    console.error('[GET /api/admin/content/contact]', err);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      pageContent: { en: Record<string, string>; ar: Record<string, string> };
      details: CompanyProfile;
    };

    if (!body.pageContent || !body.details) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const [baseEn, baseAr] = await Promise.all([getMessages('en'), getMessages('ar')]);

    // Synchronize messages with profile values for consistency
    const updatedEnPage = {
      ...body.pageContent.en,
      address_value: body.details.address_en || body.pageContent.en.address_value,
      phone_value:   body.details.phone || body.pageContent.en.phone_value,
      hours_value:   body.details.working_hours_en || body.pageContent.en.hours_value,
    };

    const updatedArPage = {
      ...body.pageContent.ar,
      address_value: body.details.address_ar || body.pageContent.ar.address_value,
      phone_value:   body.details.phone || body.pageContent.ar.phone_value,
      hours_value:   body.details.working_hours_ar || body.pageContent.ar.hours_value,
    };

    // 1. Update Supabase site_content
    await Promise.all([
      setContent('messages.en', { ...baseEn, contact_page: updatedEnPage }),
      setContent('messages.ar', { ...baseAr, contact_page: updatedArPage }),
      setContent('contact-details', body.details),
    ]);

    // 2. Synchronize local fallback files
    try {
      writeFileSync(detailsPath, JSON.stringify(body.details, null, 2), 'utf-8');
      writeFileSync(
        join(messagesDir, 'en.json'),
        JSON.stringify({ ...baseEn, contact_page: updatedEnPage }, null, 2),
        'utf-8'
      );
      writeFileSync(
        join(messagesDir, 'ar.json'),
        JSON.stringify({ ...baseAr, contact_page: updatedArPage }, null, 2),
        'utf-8'
      );
    } catch (fsErr) {
      console.warn('[POST /api/admin/content/contact] Local file sync notice:', fsErr);
    }

    // 3. Revalidate cache tags
    revalidateTag('site-messages');
    revalidateTag('site-content');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/admin/content/contact]', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
