import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendSalesAlert, sendCustomerConfirmation, SalesAlertPayload } from '@/lib/notifications';
import { validateB2bEmail } from '@/lib/validation/b2b-email-validator';
import { validateRegionalPhone } from '@/lib/validation/regional-phone-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      company: string;
      full_name: string;
      phone: string;
      email: string;
      service_interest?: string;
      locale?: 'ar' | 'en';
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
    };

    const {
      company,
      full_name,
      phone,
      email,
      service_interest,
      locale = 'ar',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
    } = body;

    if (!company?.trim() || !full_name?.trim() || !phone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Corporate email verification
    const emailValidation = validateB2bEmail(email.trim(), locale);
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

    const serviceName = service_interest?.trim() || 'عام / كافة التخصصات';
    const subject = `طلب تحميل الملف التعريفي وسابقة الأعمال — ${serviceName}`;

    let messageContent = `مجال الاهتمام الرئيسي: ${serviceName}`;
    if (utm_source || utm_campaign || utm_medium) {
      messageContent += `\n\n[بيانات الحملة الإعلانية / UTM Attribution]\nالمصدر: ${utm_source || 'مباشر'}\nالحملة: ${utm_campaign || 'غير محدد'}\nالوسيط: ${utm_medium || 'غير محدد'}`;
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('inquiries').insert({
      full_name: full_name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: validatedPhone,
      subject,
      message: messageContent,
      source: 'lead_magnet',
      status: 'new',
    });

    if (error) {
      console.error('[POST /api/lead-magnet] Supabase insert error:', error);
      throw error;
    }

    // Trigger instant sales alert and customer confirmation in parallel (fail-safe)
    const alertPayload: SalesAlertPayload = {
      type: 'lead_magnet',
      name: full_name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: validatedPhone,
      subject,
      service: serviceName,
      message: messageContent,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      file_url: 'https://xdkfmduiftxisifetfmu.supabase.co/storage/v1/object/public/attachments/documents/BetaVolt-Company-Pre-Qualification.pdf',
      file_name: 'ملف التأهيل وسابقة الأعمال الرسمية (BetaVolt-Profile.pdf)',
    };

    await Promise.allSettled([
      sendSalesAlert(alertPayload),
      sendCustomerConfirmation(alertPayload),
    ]);

    return NextResponse.json({
      success: true,
      downloadUrl: '/api/lead-magnet/download',
    }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/lead-magnet] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
