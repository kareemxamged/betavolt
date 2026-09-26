import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSalesAlert, sendCustomerConfirmation, SalesAlertPayload } from '@/lib/notifications';
import { validateB2bEmail } from '@/lib/validation/b2b-email-validator';
import { validateRegionalPhone } from '@/lib/validation/regional-phone-validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, service, details, locale = 'ar', utm_source, utm_medium, utm_campaign, utm_content } = body;

    if (!name || !email || !service || !details) {
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

    let validatedPhone = phone?.trim() || null;
    if (phone?.trim()) {
      const phoneValidation = validateRegionalPhone(phone.trim(), 'SA', locale);
      if (!phoneValidation.isValid) {
        return NextResponse.json({
          error: phoneValidation.errorType,
          message: phoneValidation.message,
        }, { status: 422 });
      }
      validatedPhone = phoneValidation.formattedE164 || phone.trim();
    }

    const { error } = await supabase.from('inquiries').insert([{
      full_name: name,
      email,
      company:   company || null,
      phone:     validatedPhone,
      subject:   service,
      message:   details,
      status:    'new',
      source:    'contact_form',
    }]);

    if (error) {
      console.error('[Contact API] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
    }

    // Trigger instant sales alert and customer confirmation in parallel (fail-safe)
    const alertPayload: SalesAlertPayload = {
      type: 'contact_message',
      name,
      company: company || '',
      email,
      phone: validatedPhone,
      subject: service,
      service,
      message: details,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
    };

    await Promise.allSettled([
      sendSalesAlert(alertPayload),
      sendCustomerConfirmation(alertPayload),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Contact API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
