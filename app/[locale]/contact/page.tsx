import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ContactForm from '@/components/sections/ContactForm';
import { getCompanyProfile } from '@/lib/company-profile';

export const metadata: Metadata = {
  title: 'Contact Us – BetaVolt Engineering & Contracting',
  description:
    'Connect with BetaVolt\'s engineering team for project consultations, quotes, and technical support across Saudi Arabia and the UAE.',
};

type Props = { params: Promise<{ locale: string }> };

// ── Icons ──────────────────────────────────────────────────────────────────

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.4 2 2 0 0 1 3.9 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      <rect width="20" height="14" x="2" y="6" rx="2"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

// ── Contact info row ───────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: () => React.ReactElement;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700">
        <Icon />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[10px] font-black tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-1">
          {label}
        </p>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const [t, details] = await Promise.all([
    getTranslations('contact_page'),
    getCompanyProfile(),
  ]);

  const displayAddress = (isAr ? details.address_ar : details.address_en) || t('address_value');
  const displayHours = (isAr ? details.working_hours_ar : details.working_hours_en) || t('hours_value');

  return (
    <main className="overflow-x-hidden bg-white dark:bg-slate-900">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-28 bg-grid bg-slate-50 dark:bg-[#07111F] overflow-hidden">

        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(75,163,227,0.13) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        {/* Top border glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(75,163,227,0.25), transparent)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-blue-600/80 dark:text-brand-blue/70 mb-4 sm:mb-5">
            <span className="block w-8 h-px bg-brand-blue/40" aria-hidden="true" />
            {t('eyebrow')}
            <span className="block w-8 h-px bg-brand-blue/40" aria-hidden="true" />
          </p>
          <h1 className="font-black tracking-tight leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-slate-900 dark:text-white mb-5 sm:mb-6">
            {t('title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Bottom fade → blends into the white section below */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"
          aria-hidden="true"
        />
      </section>

      {/* ── Split Layout ── */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* ── Column 1: Contact Info ── */}
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                  {t('info_title')}
                </h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
              </div>

              <div className="flex flex-col gap-6">
                <InfoRow icon={MapPinIcon} label={t('address_label')}>
                  {displayAddress}
                </InfoRow>

                {details.email_general && (
                  <InfoRow icon={MailIcon} label={t('email_general_label')}>
                    <a
                      href={`mailto:${details.email_general}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      dir="ltr"
                    >
                      {details.email_general}
                    </a>
                  </InfoRow>
                )}

                {details.email_projects && (
                  <InfoRow icon={MailIcon} label={t('email_projects_label')}>
                    <a
                      href={`mailto:${details.email_projects}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      dir="ltr"
                    >
                      {details.email_projects}
                    </a>
                  </InfoRow>
                )}

                {details.email_careers && (
                  <InfoRow icon={BriefcaseIcon} label={t('email_careers_label')}>
                    <a
                      href={`mailto:${details.email_careers}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      dir="ltr"
                    >
                      {details.email_careers}
                    </a>
                  </InfoRow>
                )}

                {details.phone && (
                  <InfoRow icon={PhoneIcon} label={t('phone_label')}>
                    <a
                      href={`tel:${details.phone.replace(/\s/g, '')}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      dir="ltr"
                    >
                      {details.phone}
                    </a>
                  </InfoRow>
                )}

                <InfoRow icon={ClockIcon} label={t('hours_label')}>
                  {displayHours}
                </InfoRow>
              </div>

              {/* Promise box */}
              <div className="flex items-start gap-3 p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                <div className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">
                  <ShieldCheckIcon />
                </div>
                <div>
                  <p className="text-xs font-black tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400 mb-1">
                    {t('promise_title')}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    {t('promise_body')}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Column 2: Inquiry Form ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm dark:shadow-none p-6 sm:p-8">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6">
                {t('form_title')}
              </h2>
              <ContactForm />
            </div>

          </div>

          {/* ── Careers / Join Our Journey Section (100% Full-Width Container) ── */}
          <div className="mt-14 sm:mt-18 lg:mt-20">
            <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 dark:from-[#0B1528] dark:via-[#07111F] dark:to-[#0A1A36] p-8 sm:p-10 lg:p-12 shadow-xl shadow-blue-600/5">
              
              {/* Decorative Ambient Glows */}
              <div
                className="pointer-events-none absolute -end-24 -top-24 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -start-24 -bottom-24 w-96 h-96 rounded-full bg-sky-500/10 dark:bg-sky-500/10 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Side: Headlines & Mission */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-bold w-fit">
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    {t('careers_eyebrow')}
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {t('careers_title')}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    {t('careers_subtitle')}
                  </p>
                </div>

                {/* Right Side: Direct Action Card */}
                <div className="lg:col-span-5 flex flex-col gap-4 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-lg shadow-slate-900/5">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <BriefcaseIcon />
                    </span>
                    <span>{t('careers_cta_label')}</span>
                  </div>

                  <a
                    href={`mailto:${details.email_careers || 'careers@betavolt.com.sa'}`}
                    className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg transition-all duration-200 shadow-md shadow-blue-600/25 hover:shadow-blue-600/40"
                    dir="ltr"
                  >
                    <span className="truncate">{details.email_careers || 'careers@betavolt.com.sa'}</span>
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                      <ArrowIcon />
                    </span>
                  </a>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('careers_badge')}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">betavolt.com.sa</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
