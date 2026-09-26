import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSalesAlert, sendCustomerConfirmation, SalesAlertPayload } from '@/lib/notifications';
import { validateB2bEmail } from '@/lib/validation/b2b-email-validator';
import { validateRegionalPhone } from '@/lib/validation/regional-phone-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string;
      company: string;
      email?: string;
      phone?: string;
      project_type: string;
      timeline: string;
      requirements: string;
      file_name?: string;
      file_url?: string;
      locale?: 'ar' | 'en';
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
    };

    const { name, company, email, phone, project_type, timeline, requirements, file_name, file_url, locale = 'ar', utm_source, utm_medium, utm_campaign, utm_content } = body;

    if (!name || !company || !project_type || !timeline || !requirements || !phone?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Corporate email verification
    const emailValidation = validateB2bEmail(email, locale);
    if (!emailValidation.isValid) {
      return NextResponse.json({
        error: emailValidation.errorType,
        message: emailValidation.message,
      }, { status: 422 });
    }

    // Regional phone verification (GCC & Egypt only, anti-dummy)
    const phoneValidation = validateRegionalPhone(phone.trim(), 'SA', locale);
    if (!phoneValidation.isValid) {
      return NextResponse.json({
        error: phoneValidation.errorType,
        message: phoneValidation.message,
      }, { status: 422 });
    }

    const validatedPhone = phoneValidation.formattedE164 || phone.trim();

    const subject = `${project_type} — ${timeline}`;

    const { error } = await supabase.from('inquiries').insert({
      full_name: name,
      company,
      email:     email   || null,
      phone:     validatedPhone,
      subject,
      message:   requirements,
      file_name: file_name || null,
      file_url:  file_url  || null,
      source:    'quote_form',
      status:    'new',
    });

    if (error) throw error;

    // Trigger instant sales alert and customer confirmation in parallel (fail-safe)
    const alertPayload: SalesAlertPayload = {
      type: 'quote_request',
      name,
      company,
      email,
      phone: validatedPhone,
      subject,
      service: project_type,
      timeline,
      file_name,
      file_url,
      message: requirements,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
    };

    await Promise.allSettled([
      sendSalesAlert(alertPayload),
      sendCustomerConfirmation(alertPayload),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/quote]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
