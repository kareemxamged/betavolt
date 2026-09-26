import { readFileSync } from 'fs';
import { join } from 'path';
import { getContent } from '@/lib/content-store';
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { getCompanyProfile, formatWhatsAppUrl } from '@/lib/company-profile';

/* ─── Footer content (social links) from CMS JSON ───── */
interface FooterContent {
  social: {
    linkedin: string; twitter: string; youtube: string; whatsapp: string;
    facebook: string; instagram: string; snapchat: string; tiktok: string;
  };
}

async function loadFooterContent(): Promise<FooterContent> {
  try {
    const db = await getContent('footer-content');
    if (db) return db as unknown as FooterContent;
  } catch { /* fall through */ }
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data', 'footer-content.json'), 'utf-8'));
  } catch {
    return { social: { linkedin: '', twitter: '', youtube: '', whatsapp: '', facebook: '', instagram: '', snapchat: '', tiktok: '' } };
  }
}

/* ─── Brand Social SVG Icons ─────────────────────────── */
function IconLinkedIn() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.107.553 4.084 1.514 5.8L0 24l6.352-1.49A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.013-1.375l-.36-.213-3.73.876.892-3.646-.236-.374A9.783 9.783 0 0 1 2.182 12c0-5.418 4.4-9.818 9.818-9.818 5.418 0 9.818 4.4 9.818 9.818 0 5.418-4.4 9.818-9.818 9.818z"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function IconSnapchat() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.166 2C9.065 2 6.89 3.648 6.89 6.989v.63l-1.027-.145a.44.44 0 0 0-.498.368l-.073.53a.44.44 0 0 0 .368.499l1.265.175c-.054.17-.111.34-.172.508-.314.872-.74 1.594-1.303 2.07-.243.205-.38.492-.38.793 0 .12.023.24.07.353.19.462.666.74 1.194.74.07 0 .14-.006.21-.018.357-.062.762-.17 1.205-.31.362.878 1.175 1.517 2.22 1.517.318 0 .63-.065.912-.192.224.1.47.153.728.153.254 0 .502-.05.726-.148.283.127.596.191.914.191 1.044 0 1.857-.638 2.22-1.516.441.14.847.248 1.205.31.07.012.14.017.21.017.527 0 1.004-.278 1.193-.74a.968.968 0 0 0 .07-.352c0-.3-.136-.588-.38-.793-.562-.476-.989-1.198-1.302-2.07a7.48 7.48 0 0 1-.173-.508l1.266-.175a.44.44 0 0 0 .368-.499l-.073-.53a.44.44 0 0 0-.499-.368l-1.026.145v-.63C17.11 3.649 14.934 2 12.166 2z"/>
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.77 1.52V7.01a4.85 4.85 0 0 1-1-.32z"/>
    </svg>
  );
}

/* ─── Column heading ─────────────────────────────────── */
function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-accent mb-5 flex items-center gap-2">
      <span className="block w-4 h-px bg-brand-accent/40" aria-hidden="true" />
      {children}
    </h3>
  );
}

/* ─── Nav link with animated dash ───────────────────── */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as '/'}
      className="group flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors duration-150"
    >
      <span
        className="block h-px bg-brand-blue/30 group-hover:bg-brand-blue transition-all duration-250 shrink-0"
        style={{ width: '10px' }}
        aria-hidden="true"
      />
      {children}
    </Link>
  );
}

/* ─── Footer ─────────────────────────────────────────── */
export default async function Footer() {
  const [details, footerContent, locale] = await Promise.all([
    getCompanyProfile(),
    loadFooterContent(),
    getLocale(),
  ]);
  const year          = new Date().getFullYear();

  const [tf, tn, tc] = await Promise.all([
    getTranslations('footer'),
    getTranslations('nav'),
    getTranslations('contact_page'),
  ]);

  const isAr = locale === 'ar';
  const displayAddress = (isAr ? details.address_ar : details.address_en) || tc('address_value');

  /* Quick nav links */
  const quickLinks = [
    { href: '/services', label: tn('services') },
    { href: '/projects', label: tn('projects') },
    { href: '/about',    label: tn('about')    },
    { href: '/contact',  label: tn('contact')  },
  ];

  /* Service lines — read directly from contact_page messages file for safety,
     service titles are fetched via a separate translation namespace */
  const serviceNames = await getTranslations('services_section');
  const serviceLinks = [
    serviceNames('cards.power.title'),
    serviceNames('cards.solar.title'),
    serviceNames('cards.low_current.title'),
    serviceNames('cards.data_centers.title'),
    serviceNames('cards.bms.title'),
    serviceNames('cards.plc_scada.title'),
  ];

  /* Social icons — only rendered when URL is set */
  type SocialItem = { href: string; label: string; Icon: () => React.ReactElement };
  const { social } = footerContent;
  const socials: SocialItem[] = [
    social.linkedin
      ? { href: social.linkedin,                                            label: 'LinkedIn',    Icon: IconLinkedIn  }
      : null,
    social.twitter
      ? { href: social.twitter,                                             label: 'X (Twitter)', Icon: IconX         }
      : null,
    social.facebook
      ? { href: social.facebook,                                            label: 'Facebook',    Icon: IconFacebook  }
      : null,
    social.instagram
      ? { href: social.instagram,                                           label: 'Instagram',   Icon: IconInstagram }
      : null,
    social.snapchat
      ? { href: social.snapchat,                                            label: 'Snapchat',    Icon: IconSnapchat  }
      : null,
    social.tiktok
      ? { href: social.tiktok,                                              label: 'TikTok',      Icon: IconTikTok    }
      : null,
    social.youtube
      ? { href: social.youtube,                                             label: 'YouTube',     Icon: IconYouTube   }
      : null,
    social.whatsapp
      ? { href: formatWhatsAppUrl(social.whatsapp),                       label: 'WhatsApp',    Icon: IconWhatsApp  }
      : null,
  ].filter(Boolean) as SocialItem[];

  return (
    <footer className="relative bg-navy-900 dark:bg-navy-950 text-white">

      {/* ── Glowing top separator ── */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(75,163,227,0.4) 30%, rgba(234,179,8,0.25) 60%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 xl:gap-10">

          {/* ─── Col 1: Company ─── */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">

            {/* Logo wordmark */}
            <Link href="/" className="flex items-center gap-2.5 w-fit group" aria-label="BetaVolt home">
              <Image
                src="/images/logo-icon.png"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 shrink-0 object-contain"
              />
              <span className="font-orbitron font-black text-[1.1rem] tracking-wide leading-none select-none">
                <span className="text-white group-hover:text-slate-200 transition-colors">BETA</span>
                <span className="text-brand-blue group-hover:text-brand-blue-hover transition-colors">VOLT</span>
              </span>
            </Link>

            {/* Company bio */}
            <p className="text-sm text-slate-400 leading-relaxed max-w-[260px]">
              {tf('bio')}
            </p>

            {/* Social icons */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 dark:bg-slate-800/70 text-slate-400 hover:bg-brand-blue hover:text-white border border-slate-700/60 dark:border-slate-700/40 hover:border-brand-blue transition-all duration-200 shrink-0"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}

            {/* Certification badge */}
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase text-brand-accent/80 bg-brand-accent/8 border border-brand-accent/20 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse shrink-0" aria-hidden="true" />
                {tf('badge')}
              </span>
            </div>
          </div>

          {/* ─── Col 2: Quick Links ─── */}
          <div className="flex flex-col">
            <ColHeading>{tf('col_links')}</ColHeading>
            <ul className="flex flex-col gap-3">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Col 3: Services ─── */}
          <div className="flex flex-col">
            <ColHeading>{tf('col_services')}</ColHeading>
            <ul className="flex flex-col gap-3">
              {serviceLinks.map((label, i) => (
                <li key={i}>
                  <FooterLink href="/services">{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Col 4: Contact Info ─── */}
          <div className="flex flex-col">
            <ColHeading>{tf('col_contact')}</ColHeading>
            <ul className="flex flex-col gap-4">

              {/* Address */}
              <li className="flex items-start gap-3">
                <MapPin
                  size={15}
                  strokeWidth={1.75}
                  className="shrink-0 mt-0.5 text-brand-blue/60"
                />
                <span className="text-sm text-slate-400 leading-snug">
                  {displayAddress}
                </span>
              </li>

              {/* General email */}
              {details.email_general && (
                <li className="flex items-start gap-3">
                  <Mail
                    size={15}
                    strokeWidth={1.75}
                    className="shrink-0 mt-0.5 text-brand-blue/60"
                  />
                  <a
                    href={`mailto:${details.email_general}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-150 break-all"
                    dir="ltr"
                  >
                    {details.email_general}
                  </a>
                </li>
              )}

              {/* Projects email */}
              {details.email_projects && (
                <li className="flex items-start gap-3">
                  <Mail
                    size={15}
                    strokeWidth={1.75}
                    className="shrink-0 mt-0.5 text-brand-blue/60"
                  />
                  <a
                    href={`mailto:${details.email_projects}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-150 break-all"
                    dir="ltr"
                  >
                    {details.email_projects}
                  </a>
                </li>
              )}

              {/* Phone */}
              {details.phone && (
                <li className="flex items-start gap-3">
                  <Phone
                    size={15}
                    strokeWidth={1.75}
                    className="shrink-0 mt-0.5 text-brand-blue/60"
                  />
                  <a
                    href={`tel:${details.phone.replace(/\s/g, '')}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    dir="ltr"
                  >
                    {details.phone}
                  </a>
                </li>
              )}

              {/* WhatsApp */}
              {details.whatsapp && (
                <li className="flex items-start gap-3">
                  <MessageCircle
                    size={15}
                    strokeWidth={1.75}
                    className="shrink-0 mt-0.5 text-brand-blue/60"
                  />
                  <a
                    href={formatWhatsAppUrl(details.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    dir="ltr"
                  >
                    {details.whatsapp}
                  </a>
                </li>
              )}

            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-slate-800 dark:border-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright */}
          <p className="text-xs text-slate-500 text-center sm:text-start order-2 sm:order-1">
            <span className="text-slate-400">©&thinsp;{year}</span>
            {' '}
            {tf('copyright')}
          </p>

          {/* Social icons (bottom bar) — shown when no sidebar icons space */}
          {socials.length > 0 && (
            <div className="flex items-center gap-2 order-1 sm:order-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-500 hover:text-white transition-colors duration-150"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}

        </div>
      </div>

    </footer>
  );
}
