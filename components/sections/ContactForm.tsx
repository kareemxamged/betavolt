'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';
import { trackEvent, getStoredUtm } from '@/components/AnalyticsBeacon';
import { validateB2bEmail } from '@/lib/validation/b2b-email-validator';
import { validateRegionalPhone } from '@/lib/validation/regional-phone-validator';
import RegionalPhoneInput from '@/components/ui/RegionalPhoneInput';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const t = useTranslations('contact_page');
  const locale = useLocale();
  const textDir = locale === 'ar' ? 'rtl' : 'ltr';
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setEmailError(null);
    setPhoneError(null);

    const data = new FormData(e.currentTarget);
    const email = (data.get('email') as string || emailValue).trim();

    // Verify corporate email before attempting submit
    const check = validateB2bEmail(email, locale as 'ar' | 'en');
    if (!check.isValid) {
      setEmailError(check.message);
      setStatus('error');
      setErrorMessage(check.message);
      return;
    }

    // Verify regional phone if entered
    let validatedPhone: string | null = null;
    const rawPhone = ((data.get('phone') as string) || phoneValue).trim();
    if (rawPhone) {
      const phoneCheck = validateRegionalPhone(rawPhone, 'SA', locale as 'ar' | 'en');
      if (!phoneCheck.isValid) {
        setPhoneError(phoneCheck.message);
        setStatus('error');
        setErrorMessage(phoneCheck.message);
        return;
      }
      validatedPhone = phoneCheck.formattedE164 || rawPhone;
    }

    setStatus('sending');

    const payload = {
      name:    data.get('name'),
      company: data.get('company'),
      email,
      phone:   validatedPhone,
      service: data.get('service'),
      details: data.get('details'),
      locale,
      ...getStoredUtm(),
    };

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.message || t('form_error'));
      }

      setStatus('success');
      setErrorMessage('');
      setEmailError(null);
      setPhoneError(null);
      setEmailValue('');
      setPhoneValue('');
      trackEvent('contact_submit', {
        service: payload.service,
      });
      formRef.current?.reset();
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('form_error'));
    }
  }

  const inputBase =
    'w-full px-4 py-3 rounded-lg text-sm text-slate-900 dark:text-white ' +
    'bg-slate-50 dark:bg-slate-900/60 ' +
    'border border-slate-200 dark:border-slate-700 ' +
    'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
    'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
    'transition-colors duration-200';

  const labelBase = 'block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5';

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
          <CheckCircle size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t('form_success_title')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            {t('form_success_body')}
          </p>
        </div>
        <button
          onClick={() => setStatus('idle')}
          className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← {t('form_submit')}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* Error banner */}
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage || t('form_error')}</span>
        </div>
      )}

      {/* Row 1: Name + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelBase}>{t('form_name')}</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputBase}
            placeholder={t('form_name')}
            dir={textDir}
          />
        </div>
        <div>
          <label htmlFor="company" className={labelBase}>{t('form_company')}</label>
          <input
            id="company"
            name="company"
            type="text"
            required
            autoComplete="organization"
            className={inputBase}
            placeholder={t('form_company')}
            dir={textDir}
          />
        </div>
      </div>

      {/* Row 2: Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelBase}>{t('form_email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={emailValue}
            onChange={(e) => {
              setEmailValue(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val) {
                const check = validateB2bEmail(val, locale as 'ar' | 'en');
                if (!check.isValid) {
                  setEmailError(check.message);
                } else {
                  setEmailError(null);
                }
              }
            }}
            className={`${inputBase} ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="name@company.com"
            dir="ltr"
          />
          {emailError ? (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1 font-medium leading-tight">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{emailError}</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {t('form_email_hint')}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className={labelBase}>{t('form_phone')}</label>
          <RegionalPhoneInput
            id="phone"
            name="phone"
            value={phoneValue}
            onChange={(val) => {
              setPhoneValue(val);
              if (phoneError) setPhoneError(null);
            }}
            error={phoneError}
            onErrorChange={setPhoneError}
            locale={locale as 'ar' | 'en'}
            variant="standard"
            required={false}
          />
        </div>
      </div>

      {/* Row 3: Service */}
      <div>
        <label htmlFor="service" className={labelBase}>{t('form_service')}</label>
        <select
          id="service"
          name="service"
          required
          defaultValue=""
          className={inputBase + ' cursor-pointer'}
        >
          <option value="" disabled>{t('form_service_placeholder')}</option>
          <option value="infrastructure">{t('form_service_infrastructure')}</option>
          <option value="data-centers">{t('form_service_data_centers')}</option>
          <option value="low-current">{t('form_service_low_current')}</option>
          <option value="power-electrical">{t('form_service_power')}</option>
          <option value="bms">{t('form_service_bms')}</option>
          <option value="automation">{t('form_service_automation')}</option>
        </select>
      </div>

      {/* Row 4: Details */}
      <div>
        <label htmlFor="details" className={labelBase}>{t('form_details')}</label>
        <textarea
          id="details"
          name="details"
          required
          rows={5}
          className={inputBase + ' resize-none'}
          placeholder={t('form_details_placeholder')}
          dir={textDir}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="
          w-full flex items-center justify-center gap-2
          px-6 py-3.5 min-h-[52px]
          rounded-lg
          bg-blue-600 hover:bg-blue-700 disabled:opacity-60
          text-white font-bold text-sm
          shadow-sm hover:shadow-[0_0_16px_rgba(59,130,246,0.35)]
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        "
      >
        {status === 'sending' ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
            {t('form_sending')}
          </>
        ) : (
          <>
            <Send size={15} strokeWidth={2.5} />
            {t('form_submit')}
          </>
        )}
      </button>

    </form>
  );
}
