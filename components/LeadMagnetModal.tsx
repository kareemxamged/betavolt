'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import {
  FileCheck2, Building2, User, Mail, ArrowDownToLine,
  X, CheckCircle2, AlertCircle, Loader2, MessageSquare, ChevronDown,
} from 'lucide-react';
import { trackEvent, getStoredUtm } from '@/components/AnalyticsBeacon';
import { validateB2bEmail } from '@/lib/validation/b2b-email-validator';
import { validateRegionalPhone } from '@/lib/validation/regional-phone-validator';
import RegionalPhoneInput from '@/components/ui/RegionalPhoneInput';

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES_OPTIONS = {
  ar: [
    { value: 'Data Centers', label: 'مراكز البيانات وتجهيز الغرف الحساسة (Data Centers)' },
    { value: 'Smart Building BMS', label: 'إدارة وتحكم المباني الذكية (Smart BMS)' },
    { value: 'Low Current Systems', label: 'أنظمة التيار الخفيف والمراقبة (Low Current)' },
    { value: 'Industrial Automation', label: 'الأتمتة الصناعية وأنظمة PLC / SCADA' },
    { value: 'Power Solutions', label: 'لوحات القوى ومحطات التحويل الكهربائية' },
    { value: 'General Engineering', label: 'كافة الخدمات والحلول الهندسية المتكاملة' },
  ],
  en: [
    { value: 'Data Centers', label: 'Mission-Critical Data Centers Infrastructure' },
    { value: 'Smart Building BMS', label: 'Smart Building Management Systems (BMS)' },
    { value: 'Low Current Systems', label: 'Low Current & Physical Security Systems' },
    { value: 'Industrial Automation', label: 'Industrial Automation & PLC / SCADA' },
    { value: 'Power Solutions', label: 'Electrical Power & MV/LV Substations' },
    { value: 'General Engineering', label: 'All Electromechanical & Contracting Solutions' },
  ],
};

export default function LeadMagnetModal({ isOpen, onClose }: LeadMagnetModalProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('/api/lead-magnet/download');

  const [formData, setFormData] = useState({
    company: '',
    full_name: '',
    phone: '',
    email: '',
    service_interest: 'Data Centers',
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset status when modal closes
      const timer = setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
        setEmailError(null);
        setPhoneError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const triggerDownload = (url: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BetaVolt-Company-Pre-Qualification.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[Download Trigger Error]:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setEmailError(null);
    setPhoneError(null);

    const email = formData.email.trim();
    const emailCheck = validateB2bEmail(email, isAr ? 'ar' : 'en');
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.message);
      setStatus('error');
      setErrorMessage(emailCheck.message);
      return;
    }

    const phone = formData.phone.trim();
    const phoneCheck = validateRegionalPhone(phone, 'SA', isAr ? 'ar' : 'en');
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.message);
      setStatus('error');
      setErrorMessage(phoneCheck.message);
      return;
    }

    setStatus('submitting');

    try {
      const utm = getStoredUtm();
      const payload = {
        ...formData,
        phone: phoneCheck.formattedE164 || phone,
        locale,
        ...utm,
      };

      const response = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || (isAr ? 'حدث خطأ أثناء إرسال البيانات' : 'Failed to submit inquiry'));
      }

      const fileUrl = data.downloadUrl || '/api/lead-magnet/download';
      setDownloadUrl(fileUrl);
      setStatus('success');

      // Dispatch telemetry event
      trackEvent('lead_magnet_download', {
        company: formData.company,
        service_interest: formData.service_interest,
      });

      // Automatically trigger the file download
      setTimeout(() => {
        triggerDownload(fileUrl);
      }, 400);

    } catch (err: unknown) {
      console.error('[Lead Magnet Submission Error]:', err);
      setStatus('error');
      const msg = err instanceof Error ? err.message : '';
      setErrorMessage(msg || (isAr ? 'تعذر إتمام الطلب، يرجى المحاولة لاحقاً' : 'Could not complete request'));
    }
  };

  const options = isAr ? SERVICES_OPTIONS.ar : SERVICES_OPTIONS.en;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="
          relative w-full max-w-lg
          bg-[#0D1527] dark:bg-[#090E1A] text-slate-100
          border border-[#1E2D4A] rounded-2xl shadow-2xl
          overflow-hidden z-10 my-auto
          animate-scale-in
        "
      >
        {/* Top Gradient Border Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 end-4 p-2 rounded-lg
            text-slate-400 hover:text-white hover:bg-slate-800/80
            border border-transparent hover:border-slate-700
            transition-all duration-150 z-20
          "
          aria-label={isAr ? 'إغلاق' : 'Close'}
        >
          <X size={18} />
        </button>

        {status === 'success' ? (
          /* ── Success & Download Confirmation State ── */
          <div className="p-6 sm:p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5 animate-bounce-subtle">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 font-cairo">
              {isAr ? 'تم استلام طلبكم بنجاح!' : 'Your Request Was Received!'}
            </h3>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-sm">
              {isAr
                ? 'جاري تنزيل الملف التعريفي وسابقة الأعمال الهندسية لشركة بيتافولت تلقائياً في متصفحكم.'
                : 'BetaVolt\'s official Pre-Qualification profile and engineering portfolio is downloading automatically.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mb-6">
              <button
                type="button"
                onClick={() => triggerDownload(downloadUrl)}
                className="
                  flex items-center justify-center gap-2
                  px-5 py-3 rounded-xl
                  bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500
                  text-white font-bold text-xs sm:text-sm
                  shadow-lg shadow-blue-500/20 transition-all
                "
              >
                <ArrowDownToLine size={16} />
                {isAr ? 'إذا لم يبدأ التنزيل اضغط هنا' : 'Click here if download did not start'}
              </button>

              <a
                href="https://wa.me/966580178629"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-center gap-2
                  px-5 py-3 rounded-xl
                  bg-emerald-600/20 hover:bg-emerald-600/30
                  border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm
                  transition-all
                "
              >
                <MessageSquare size={16} />
                {isAr ? 'محادثة المبيعات عبر واتساب' : 'Chat via WhatsApp'}
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              {isAr ? 'العودة للموقع' : 'Return to Website'}
            </button>
          </div>
        ) : (
          /* ── Form State ── */
          <div className="p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight font-cairo">
                  {isAr
                    ? 'تحميل الملف التعريفي وسابقة الأعمال الهندسية'
                    : 'Download Company Pre-Qualification Profile'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isAr
                    ? 'النسخة الرسمية المعتمدة لعام 2025 تشمل اعتمادات وسوابق مشاريع مراكز البيانات، BMS، والأنظمة الذكية.'
                    : 'Official 2025 dossier covering project portfolios and credentials in Data Centers, BMS, and Automation.'}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {status === 'error' && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Company */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  {isAr ? 'اسم الشركة أو المكتب الاستشاري *' : 'Company or Consulting Firm *'}
                </label>
                <div className="relative">
                  <Building2 size={16} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`} />
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: شركة المقاولات الهندسية / دار الهندسة' : 'e.g. Engineering Contractors / Parsons'}
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`
                      w-full ${isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} py-2.5 rounded-xl
                      bg-[#070B14] border border-[#1E2D4A]
                      text-xs sm:text-sm text-white placeholder:text-slate-500
                      focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400
                      transition-colors
                    `}
                  />
                </div>
              </div>

              {/* Full Name & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    {isAr ? 'اسم المسؤول أو المهندس *' : 'Contact Person / Engineer *'}
                  </label>
                  <div className="relative">
                    <User size={16} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`} />
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'الاسم الكريم' : 'Full Name'}
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={`
                        w-full ${isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} py-2.5 rounded-xl
                        bg-[#070B14] border border-[#1E2D4A]
                        text-xs sm:text-sm text-white placeholder:text-slate-500
                        focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400
                        transition-colors
                      `}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    {isAr ? 'رقم الهاتف أو الجوال *' : 'Phone / Mobile Number *'}
                  </label>
                  <RegionalPhoneInput
                    id="lm-phone"
                    value={formData.phone}
                    onChange={(val) => {
                      setFormData(prev => ({ ...prev, phone: val }));
                      if (phoneError) setPhoneError(null);
                    }}
                    error={phoneError}
                    onErrorChange={setPhoneError}
                    locale={isAr ? 'ar' : 'en'}
                    variant="modal-dark"
                    required
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  {isAr ? 'البريد الإلكتروني للعمل *' : 'Corporate Email Address *'}
                </label>
                <div className="relative">
                  <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`} />
                  <input
                    type="email"
                    required
                    placeholder={isAr ? 'engineer@company.com.sa' : 'engineer@company.com.sa'}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (emailError) setEmailError(null);
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        const check = validateB2bEmail(val, isAr ? 'ar' : 'en');
                        if (!check.isValid) {
                          setEmailError(check.message);
                        } else {
                          setEmailError(null);
                        }
                      }
                    }}
                    className={`
                      w-full ${isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} py-2.5 rounded-xl
                      bg-[#070B14] ${emailError ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-[#1E2D4A] focus:ring-cyan-400 focus:border-cyan-400'}
                      text-xs sm:text-sm text-white placeholder:text-slate-500
                      focus:outline-none focus:ring-1
                      transition-colors
                    `}
                  />
                </div>
                {emailError ? (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-start gap-1 font-medium leading-tight">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{emailError}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {isAr
                      ? 'يُقبل فقط البريد المهني التابع لجهة العمل أو الشركة لتأكيد الاعتماد'
                      : 'Corporate or official business domains only'}
                  </p>
                )}
              </div>

              {/* Service Interest */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  {isAr ? 'مجال الاهتمام بالمشاريع' : 'Primary Project Interest'}
                </label>
                <div className="relative">
                  <select
                    value={formData.service_interest}
                    onChange={(e) => setFormData({ ...formData, service_interest: e.target.value })}
                    className={`
                      w-full ${isAr ? 'pr-4 pl-10 text-right' : 'pl-4 pr-10 text-left'} py-2.5 rounded-xl
                      bg-[#070B14] border border-[#1E2D4A]
                      text-xs sm:text-sm text-white
                      focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400
                      transition-colors appearance-none cursor-pointer
                    `}
                  >
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0D1527] text-slate-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="
                    w-full flex items-center justify-center gap-2
                    py-3 rounded-xl
                    bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400
                    text-white font-bold text-sm
                    shadow-lg shadow-blue-600/30 active:scale-[0.99]
                    transition-all duration-150 disabled:opacity-50 cursor-pointer
                  "
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{isAr ? 'جاري التحقق وتجهيز الملف...' : 'Preparing Dossier...'}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine size={16} />
                      <span>{isAr ? 'تحميل ملف التأهيل وسابقة الأعمال الآن (PDF)' : 'Download Pre-Qualification Profile (PDF)'}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-500">
                {isAr
                  ? '🔒 بياناتك محمية وفق نظام حماية البيانات الشخصية السعودي (PDPL) ولن يتم مشاركتها مطلقاً.'
                  : '🔒 Your corporate data is protected under the Saudi PDPL and will never be shared.'}
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * Quick trigger button component that can be placed in Hero, Navbar, or CTAs.
 */
export function LeadMagnetTriggerButton({
  className = '',
  label,
  subtitle,
  variant = 'bar',
}: {
  className?: string;
  label?: string;
  subtitle?: string;
  variant?: 'bar' | 'compact';
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  const defaultLabel = isAr
    ? 'تحميل ملف التأهيل وسابقة الأعمال الهندسية'
    : 'Download Pre-Qualification Profile';

  const defaultSubtitle = isAr
    ? 'النسخة المعتمدة لمشاريع مراكز البيانات و BMS'
    : 'Official Credentials for Data Centers & BMS';

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            className ||
            `
            inline-flex items-center justify-center gap-2
            px-5 py-3.5
            min-h-[48px]
            rounded-lg
            border border-cyan-500/40 hover:border-cyan-400
            text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-white
            font-bold text-sm sm:text-[0.95rem]
            bg-white dark:bg-[#0C1425]/90 hover:bg-cyan-50 dark:hover:bg-cyan-950/40
            shadow-sm dark:shadow-lg dark:shadow-cyan-950/40
            transition-all duration-200 hover:scale-[1.02] active:scale-100 cursor-pointer
          `
          }
        >
          <FileCheck2 size={18} className="text-cyan-500 dark:text-cyan-400 shrink-0" />
          <span className="whitespace-nowrap">{label || defaultLabel}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            className ||
            `
            group w-full max-w-lg
            inline-flex items-center justify-between gap-3
            px-4 py-3 sm:px-5 sm:py-3.5
            min-h-[54px]
            rounded-xl
            border border-cyan-500/40 dark:border-cyan-500/30 hover:border-cyan-500 dark:hover:border-cyan-400
            bg-slate-50/90 dark:bg-[#0C1425]/90 hover:bg-cyan-50/70 dark:hover:bg-cyan-950/40
            text-slate-800 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white
            shadow-sm hover:shadow-md dark:shadow-lg dark:shadow-cyan-950/30
            transition-all duration-200 hover:scale-[1.01] active:scale-100 cursor-pointer text-start
          `
          }
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                  {label || defaultLabel}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shrink-0">
                  PDF
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 hidden sm:block">
                {subtitle || defaultSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform ps-2">
            <span className="hidden md:inline">{isAr ? 'تنزيل الملف' : 'Download'}</span>
            <ArrowDownToLine size={16} />
          </div>
        </button>
      )}

      <LeadMagnetModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
