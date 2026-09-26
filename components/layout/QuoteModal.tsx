'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, AlertCircle, Upload, X, Send, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent, getStoredUtm } from '@/components/AnalyticsBeacon';
import { validateB2bEmail } from '@/lib/validation/b2b-email-validator';
import { validateRegionalPhone } from '@/lib/validation/regional-phone-validator';
import RegionalPhoneInput from '@/components/ui/RegionalPhoneInput';
import type { ModalOption } from '@/lib/load-quote-modal-options';

type Status = 'idle' | 'sending' | 'success' | 'error';

interface Props {
  isOpen:       boolean;
  onClose:      () => void;
  projectTypes: ModalOption[];
  timelines:    ModalOption[];
}

export default function QuoteModal({ isOpen, onClose, projectTypes, timelines }: Props) {
  const t = useTranslations('quote_modal');
  const locale = useLocale();
  const textDir = locale === 'ar' ? 'rtl' : 'ltr';

  const [mounted, setMounted]         = useState(false);
  const [visible, setVisible]         = useState(false);
  const [status, setStatus]           = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Field values
  const [nameValue, setNameValue]               = useState('');
  const [companyValue, setCompanyValue]         = useState('');
  const [emailValue, setEmailValue]             = useState('');
  const [phoneValue, setPhoneValue]             = useState('');
  const [projectTypeValue, setProjectTypeValue] = useState('');
  const [timelineValue, setTimelineValue]       = useState('');
  const [requirementsValue, setRequirementsValue] = useState('');
  const [fileName, setFileName]                 = useState<string | null>(null);
  const [fileObj,  setFileObj]                  = useState<File | null>(null);

  // Field errors
  const [nameError, setNameError]               = useState<string | null>(null);
  const [companyError, setCompanyError]         = useState<string | null>(null);
  const [emailError, setEmailError]             = useState<string | null>(null);
  const [phoneError, setPhoneError]             = useState<string | null>(null);
  const [projectError, setProjectError]         = useState<string | null>(null);
  const [timelineError, setTimelineError]       = useState<string | null>(null);
  const [requirementsError, setRequirementsError] = useState<string | null>(null);

  const [dragging, setDragging]       = useState(false);
  const formRef     = useRef<HTMLFormElement>(null);
  const firstRef    = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Animate in/out & Telemetry
  useEffect(() => {
    if (isOpen) {
      setVisible(false);
      const raf = requestAnimationFrame(() => setVisible(true));
      trackEvent('quote_modal_open');
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus first field on open
  useEffect(() => {
    if (isOpen) setTimeout(() => firstRef.current?.focus(), 120);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      setStatus('idle');
      setErrorMessage('');
      setNameValue('');
      setNameError(null);
      setCompanyValue('');
      setCompanyError(null);
      setEmailValue('');
      setEmailError(null);
      setPhoneValue('');
      setPhoneError(null);
      setProjectTypeValue('');
      setProjectError(null);
      setTimelineValue('');
      setTimelineError(null);
      setRequirementsValue('');
      setRequirementsError(null);
      setFileName(null);
      setFileObj(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 200);
  }, [onClose]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setFileObj(file);
    if (requirementsError) setRequirementsError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');

    let hasError = false;

    // 1. Name validation
    const trimmedName = nameValue.trim();
    if (!trimmedName) {
      setNameError(t('error_name_required'));
      hasError = true;
    } else {
      setNameError(null);
    }

    // 2. Company validation
    const trimmedCompany = companyValue.trim();
    if (!trimmedCompany) {
      setCompanyError(t('error_company_required'));
      hasError = true;
    } else {
      setCompanyError(null);
    }

    // 3. Email validation
    const trimmedEmail = emailValue.trim();
    if (!trimmedEmail) {
      setEmailError(t('error_email_required'));
      hasError = true;
    } else {
      const emailCheck = validateB2bEmail(trimmedEmail, locale as 'ar' | 'en');
      if (!emailCheck.isValid) {
        setEmailError(emailCheck.message);
        hasError = true;
      } else {
        setEmailError(null);
      }
    }

    // 4. Phone validation
    const trimmedPhone = phoneValue.trim();
    if (!trimmedPhone) {
      setPhoneError(t('error_phone_required'));
      hasError = true;
    } else {
      const phoneCheck = validateRegionalPhone(trimmedPhone, 'SA', locale as 'ar' | 'en');
      if (!phoneCheck.isValid) {
        setPhoneError(phoneCheck.message);
        hasError = true;
      } else {
        setPhoneError(null);
      }
    }

    // 5. Project type validation
    if (!projectTypeValue) {
      setProjectError(t('error_project_required'));
      hasError = true;
    } else {
      setProjectError(null);
    }

    // 6. Timeline validation
    if (!timelineValue) {
      setTimelineError(t('error_timeline_required'));
      hasError = true;
    } else {
      setTimelineError(null);
    }

    // 7. Requirements validation (optional if tender file is attached)
    const hasTenderFile = !!(fileObj || fileName);
    const trimmedReqs = requirementsValue.trim();
    if (!hasTenderFile && !trimmedReqs) {
      setRequirementsError(t('error_requirements_required'));
      hasError = true;
    } else {
      setRequirementsError(null);
    }

    // If client validation fails, block submit without server request
    if (hasError) {
      return;
    }

    setStatus('sending');

    let file_url: string | undefined;
    if (fileObj) {
      const ext  = fileObj.name.split('.').pop();
      const uid  = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const path = `quotes/${uid}.${ext}`;
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(path, fileObj, { upsert: false });
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(data.path);
        file_url = publicUrl;
      }
    }

    try {
      const finalRequirements = trimmedReqs ||
        (fileName
          ? (locale === 'ar'
              ? `كراسة مواصفات وجداول كميات المشروع مرفقة بالملف: ${fileName}`
              : `Project specifications and BoQ attached via document: ${fileName}`)
          : '');

      const phoneCheck = validateRegionalPhone(trimmedPhone, 'SA', locale as 'ar' | 'en');

      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         trimmedName,
          company:      trimmedCompany,
          email:        trimmedEmail,
          phone:        phoneCheck.formattedE164 || trimmedPhone,
          project_type: projectTypeValue,
          timeline:     timelineValue,
          requirements: finalRequirements,
          file_name:    fileName ?? undefined,
          file_url,
          locale,
          ...getStoredUtm(),
        }),
      });

      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.message || resData.error || t('error'));
      }

      setStatus('success');
      setErrorMessage('');
      setNameValue('');
      setNameError(null);
      setCompanyValue('');
      setCompanyError(null);
      setEmailValue('');
      setEmailError(null);
      setPhoneValue('');
      setPhoneError(null);
      setProjectTypeValue('');
      setProjectError(null);
      setTimelineValue('');
      setTimelineError(null);
      setRequirementsValue('');
      setRequirementsError(null);
      setFileName(null);
      setFileObj(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      trackEvent('quote_submit', {
        project_type: projectTypeValue,
        timeline: timelineValue,
        has_file: !!file_url,
      });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('error'));
    }
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl text-sm text-slate-900 dark:text-white ' +
    'bg-slate-50 dark:bg-slate-900/60 ' +
    'border border-slate-200 dark:border-slate-700 ' +
    'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ' +
    'transition-all duration-200';

  const labelCls = 'block text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1.5';

  if (!mounted) return null;

  const modal = (
    <div
      className={[
        'fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6',
        'transition-opacity duration-200',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      aria-modal="true"
      role="dialog"
      aria-labelledby="quote-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className={[
          'relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          'rounded-3xl border border-slate-200 dark:border-slate-800',
          'bg-white dark:bg-[#07111F]',
          'shadow-[0_32px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.7)]',
          'transition-all duration-200',
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="relative flex items-start justify-between gap-4 p-6 sm:p-8 pb-0">
          <div className="flex-1 min-w-0">
            {/* Eyebrow line */}
            <p className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400 mb-3">
              <span className="block w-5 h-px bg-blue-500/50" aria-hidden="true" />
              BetaVolt Engineering
            </p>
            <h2
              id="quote-modal-title"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug"
            >
              {t('title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-1.5">
              {t('subtitle')}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="
              shrink-0 w-9 h-9 flex items-center justify-center
              rounded-xl border border-slate-200 dark:border-slate-700
              text-slate-500 dark:text-slate-400
              hover:text-slate-900 dark:hover:text-white
              hover:border-slate-300 dark:hover:border-slate-600
              hover:bg-slate-50 dark:hover:bg-slate-800
              transition-all duration-150
            "
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 sm:mx-8 mt-6 h-px bg-slate-100 dark:bg-slate-800" />

        {/* ── Body ── */}
        <div className="p-6 sm:p-8 pt-6">

          {/* Success state */}
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle size={32} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {t('success_title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  {t('success_body')}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors duration-200"
              >
                {t('success_close')}
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

              {/* Error banner */}
              {status === 'error' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage || t('error')}</span>
                </div>
              )}

              {/* Row 1: Name + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="qm-name" className={labelCls}>
                    {t('field_name')} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    ref={firstRef}
                    id="qm-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={nameValue}
                    onChange={(e) => {
                      setNameValue(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    className={`${inputCls} ${nameError ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={t('field_name')}
                    dir={textDir}
                  />
                  {nameError && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1 font-medium leading-tight">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="qm-company" className={labelCls}>
                    {t('field_company')} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    id="qm-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={companyValue}
                    onChange={(e) => {
                      setCompanyValue(e.target.value);
                      if (companyError) setCompanyError(null);
                    }}
                    className={`${inputCls} ${companyError ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={t('field_company')}
                    dir={textDir}
                  />
                  {companyError && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1 font-medium leading-tight">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{companyError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 1b: Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="qm-email" className={labelCls}>
                    {t('field_email')} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    id="qm-email"
                    name="email"
                    type="email"
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
                    className={`${inputCls} ${emailError ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''}`}
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
                      {t('field_email_hint')}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="qm-phone" className={labelCls}>
                    {t('field_phone')} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <RegionalPhoneInput
                    id="qm-phone"
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
                    required
                  />
                </div>
              </div>

              {/* Row 2: Project Type + Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="qm-project" className={labelCls}>
                    {t('field_project_type')} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    id="qm-project"
                    name="project_type"
                    value={projectTypeValue}
                    onChange={(e) => {
                      setProjectTypeValue(e.target.value);
                      if (projectError) setProjectError(null);
                    }}
                    className={`${inputCls} cursor-pointer ${projectError ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="" disabled>{t('field_project_placeholder')}</option>
                    {projectTypes.map((opt, i) => (
                      <option key={i} value={opt.en}>
                        {locale === 'ar' ? opt.ar : opt.en}
                      </option>
                    ))}
                  </select>
                  {projectError && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1 font-medium leading-tight">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{projectError}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="qm-timeline" className={labelCls}>
                    {t('field_timeline')} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    id="qm-timeline"
                    name="timeline"
                    value={timelineValue}
                    onChange={(e) => {
                      setTimelineValue(e.target.value);
                      if (timelineError) setTimelineError(null);
                    }}
                    className={`${inputCls} cursor-pointer ${timelineError ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="" disabled>{t('field_timeline_placeholder')}</option>
                    {timelines.map((opt, i) => (
                      <option key={i} value={opt.en}>
                        {locale === 'ar' ? opt.ar : opt.en}
                      </option>
                    ))}
                  </select>
                  {timelineError && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1 font-medium leading-tight">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{timelineError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: File Upload */}
              <div>
                <label className={labelCls}>
                  {t('field_upload')}{' '}
                  <span className="text-slate-400 font-normal lowercase">({locale === 'ar' ? 'اختياري' : 'optional'})</span>
                </label>

                {/* Single persistent input — avoids onChange loss on state switch */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf,.jpg,.jpeg,image/jpeg,.png,image/png"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {fileName ? (
                  /* ── File selected state ── */
                  <div className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileText size={16} strokeWidth={1.75} />
                    </div>
                    <p className="flex-1 min-w-0 text-sm font-semibold text-blue-700 dark:text-blue-300 truncate">
                      {fileName}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFileName(null);
                        setFileObj(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150"
                      aria-label="Remove file"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  /* ── Empty / drag state ── */
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      handleFile(e.dataTransfer.files[0]);
                    }}
                    className={[
                      'flex flex-col items-center justify-center gap-2 w-full px-6 py-8 rounded-xl cursor-pointer',
                      'border-2 border-dashed transition-all duration-200',
                      dragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/10',
                    ].join(' ')}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Upload size={18} strokeWidth={1.75} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {t('field_upload_cta')}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {t('field_upload_hint')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Requirements */}
              <div>
                <label htmlFor="qm-requirements" className={labelCls}>
                  {t('field_requirements')}{' '}
                  {!fileName && !fileObj && <span className="text-red-500 font-bold">*</span>}
                </label>
                <textarea
                  id="qm-requirements"
                  name="requirements"
                  rows={4}
                  value={requirementsValue}
                  onChange={(e) => {
                    setRequirementsValue(e.target.value);
                    if (requirementsError) setRequirementsError(null);
                  }}
                  className={`${inputCls} resize-none ${requirementsError ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('field_requirements_placeholder')}
                  dir={textDir}
                />
                {requirementsError && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1 font-medium leading-tight">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{requirementsError}</span>
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="
                  w-full flex items-center justify-center gap-2
                  px-6 py-4 min-h-[54px] rounded-xl
                  bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                  text-white font-bold text-sm
                  shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                "
              >
                {status === 'sending' ? (
                  <>
                    <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                    </svg>
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    <Send size={15} strokeWidth={2.5} />
                    {t('submit')}
                  </>
                )}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
