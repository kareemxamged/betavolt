'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Save, RefreshCw } from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangProvider';

/* ─── Types ──────────────────────────────────────────── */
interface FooterContent {
  social: {
    linkedin: string; twitter: string; youtube: string; whatsapp: string;
    facebook: string; instagram: string; snapchat: string; tiktok: string;
  };
}

/* ─── Bilingual labels ───────────────────────────────── */
const L = {
  en: {
    pageTitle:    'Footer Content',
    pageDesc:     'Edit the global footer text and social media links. Changes appear on every page.',
    sectionA:     'A — Company Column',
    sectionB:     'B — Column Headings',
    sectionC:     'C — Bottom Bar',
    sectionD:     'D — Social Media Links',
    bio:          'Company Bio',
    badge:        'Certification Badge',
    colLinks:     'Quick Links Column',
    colServices:  'Services Column',
    colContact:   'Contact Column',
    copyright:    'Copyright Text',
    copyHint:     'The current year is prepended automatically — e.g. © 2025 …',
    socialDesc:   'Icons appear in the footer only when a URL is set. Leave blank to hide.',
    divPlatforms: 'Platforms',
    activeHint:   'Active — icon will show in footer',
    blankHint:    'Leave blank to hide this icon from the footer',
    flagEn:       '🇬🇧', flagAr: '🇸🇦', colEn: 'English', colAr: 'Arabic',
    save:         'Save Changes', saving: 'Saving…', saved: '✓ Saved!',
    saveHint:     'Saves to message files and footer-content.json — changes are live immediately.',
  },
  ar: {
    pageTitle:    'محتوى تذييل الصفحة',
    pageDesc:     'تعديل نصوص تذييل الصفحة وروابط التواصل الاجتماعي. يظهر على كل صفحة.',
    sectionA:     'أ — عمود الشركة',
    sectionB:     'ب — عناوين الأعمدة',
    sectionC:     'ج — الشريط السفلي',
    sectionD:     'د — روابط التواصل الاجتماعي',
    bio:          'نبذة عن الشركة',
    badge:        'شارة الشهادة',
    colLinks:     'عمود الروابط السريعة',
    colServices:  'عمود الخدمات',
    colContact:   'عمود التواصل',
    copyright:    'نص حقوق النشر',
    copyHint:     'يُضاف السنة الحالية تلقائيًا — مثال: © 2025 …',
    socialDesc:   'تظهر الأيقونات في التذييل فقط عند تعيين رابط. اتركها فارغة للإخفاء.',
    divPlatforms: 'المنصات',
    activeHint:   'مفعّل — ستظهر الأيقونة في التذييل',
    blankHint:    'اترك فارغًا لإخفاء هذه الأيقونة من التذييل',
    flagEn:       '🇬🇧', flagAr: '🇸🇦', colEn: 'الإنجليزية', colAr: 'العربية',
    save:         'حفظ التغييرات', saving: 'جارٍ الحفظ…', saved: '✓ تم الحفظ!',
    saveHint:     'يتم الحفظ في ملفات الرسائل وملف footer-content.json — فوري.',
  },
};

type T = typeof L['en'];

/* ─── Style tokens ───────────────────────────────────── */
const LABEL    = 'block text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400 mb-1.5';
const INPUT    = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-500 transition-colors';
const TEXTAREA = INPUT + ' resize-none leading-relaxed';

/* ─── Social SVG icons ───────────────────────────────── */
function LinkedInSvg()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>; }
function TwitterSvg()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function YoutubeSvg()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>; }
function WhatsAppSvg()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.107.553 4.084 1.514 5.8L0 24l6.352-1.49A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.013-1.375l-.36-.213-3.73.876.892-3.646-.236-.374A9.783 9.783 0 0 1 2.182 12c0-5.418 4.4-9.818 9.818-9.818 5.418 0 9.818 4.4 9.818 9.818 0 5.418-4.4 9.818-9.818 9.818z"/></svg>; }
function FacebookSvg()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>; }
function InstagramSvg() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>; }
function SnapchatSvg()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.166 2C9.065 2 6.89 3.648 6.89 6.989v.63l-1.027-.145a.44.44 0 0 0-.498.368l-.073.53a.44.44 0 0 0 .368.499l1.265.175c-.054.17-.111.34-.172.508-.314.872-.74 1.594-1.303 2.07-.243.205-.38.492-.38.793 0 .12.023.24.07.353.19.462.666.74 1.194.74.07 0 .14-.006.21-.018.357-.062.762-.17 1.205-.31.362.878 1.175 1.517 2.22 1.517.318 0 .63-.065.912-.192.224.1.47.153.728.153.254 0 .502-.05.726-.148.283.127.596.191.914.191 1.044 0 1.857-.638 2.22-1.516.441.14.847.248 1.205.31.07.012.14.017.21.017.527 0 1.004-.278 1.193-.74a.968.968 0 0 0 .07-.352c0-.3-.136-.588-.38-.793-.562-.476-.989-1.198-1.302-2.07a7.48 7.48 0 0 1-.173-.508l1.266-.175a.44.44 0 0 0 .368-.499l-.073-.53a.44.44 0 0 0-.499-.368l-1.026.145v-.63C17.11 3.649 14.934 2 12.166 2z"/></svg>; }
function TikTokSvg()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.77 1.52V7.01a4.85 4.85 0 0 1-1-.32z"/></svg>; }

/* ─── Shared components ──────────────────────────────── */
function BiField({ label, valueEn, valueAr, onEn, onAr, rows = 1, placeholderEn = '', placeholderAr = '', t }: {
  label: string; valueEn: string; valueAr: string;
  onEn: (v: string) => void; onAr: (v: string) => void;
  rows?: number; placeholderEn?: string; placeholderAr?: string; t: T;
}) {
  return (
    <div className="space-y-2">
      <p className={LABEL}>{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3" dir="ltr">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
            <span>{t.flagEn}</span>{t.colEn}
          </span>
          {rows > 1
            ? <textarea className={TEXTAREA} value={valueEn} onChange={e => onEn(e.target.value)} rows={rows} dir="ltr" placeholder={placeholderEn} />
            : <input    className={INPUT}    value={valueEn} onChange={e => onEn(e.target.value)} dir="ltr"  placeholder={placeholderEn} />}
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
            <span>{t.flagAr}</span>{t.colAr}
          </span>
          {rows > 1
            ? <textarea className={TEXTAREA} value={valueAr} onChange={e => onAr(e.target.value)} rows={rows} dir="rtl" placeholder={placeholderAr} />
            : <input    className={INPUT}    value={valueAr} onChange={e => onAr(e.target.value)} dir="rtl"  placeholder={placeholderAr} />}
        </div>
      </div>
    </div>
  );
}

function SocialField({ label, value, onChange, placeholder, Icon, t }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; Icon: () => React.ReactElement; t: T;
}) {
  return (
    <div className="space-y-2">
      <label className={LABEL}>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-600 dark:text-slate-300"><Icon /></span>
          {label}
        </span>
      </label>
      <input
        className={INPUT}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        dir="ltr"
        type="url"
      />
      {value
        ? <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            {t.activeHint}
          </p>
        : <p className="text-[10px] text-slate-400 dark:text-slate-600">{t.blankHint}</p>
      }
    </div>
  );
}

function SectionCard({ title, badge, children, defaultOpen = false }: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 text-start hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150">
        {badge && (
          <span className="shrink-0 w-6 h-6 rounded-md bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">{badge}</span>
        )}
        <span className="flex-1 font-bold text-slate-900 dark:text-white text-sm">{title}</span>
        <ChevronDown size={15} strokeWidth={2.5}
          className={['shrink-0 text-slate-400 transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '9999px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 sm:pt-5 flex flex-col gap-4 sm:gap-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function FieldDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-600 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function FooterContentPage() {
  const { lang } = useAdminLang();
  const t = L[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const [pageEn,        setPageEn]        = useState<Record<string, string>>({});
  const [pageAr,        setPageAr]        = useState<Record<string, string>>({});
  const [footerContent, setFooterContent] = useState<FooterContent>({
    social: { linkedin: '', twitter: '', youtube: '', whatsapp: '', facebook: '', instagram: '', snapchat: '', tiktok: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch('/api/admin/content/footer')
      .then(r => r.json())
      .then(d => {
        setPageEn(d.pageContent?.en ?? {});
        setPageAr(d.pageContent?.ar ?? {});
        setFooterContent(d.footerContent ?? {
          social: { linkedin: '', twitter: '', youtube: '', whatsapp: '', facebook: '', instagram: '', snapchat: '', tiktok: '' },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const en      = (k: string) => pageEn[k] ?? '';
  const ar      = (k: string) => pageAr[k] ?? '';
  const setEn   = (k: string, v: string) => setPageEn(p => ({ ...p, [k]: v }));
  const setAr   = (k: string, v: string) => setPageAr(p => ({ ...p, [k]: v }));
  const setSocial = (k: keyof FooterContent['social'], v: string) =>
    setFooterContent(f => ({ ...f, social: { ...f.social, [k]: v } }));

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content/footer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pageContent: { en: pageEn, ar: pageAr }, footerContent }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert(lang === 'ar' ? 'فشل الحفظ. حاول مرة أخرى.' : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [pageEn, pageAr, footerContent, lang]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw size={20} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-28 flex flex-col gap-4 sm:gap-5" dir={dir}>

      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{t.pageTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t.pageDesc}</p>
      </div>

      {/* A — Company Column */}
      <SectionCard title={t.sectionA} badge="A" defaultOpen>
        <BiField t={t} label={t.bio} rows={3}
          valueEn={en('bio')} valueAr={ar('bio')}
          onEn={v => setEn('bio', v)} onAr={v => setAr('bio', v)}
          placeholderEn="Certified electrical, low current, and smart infrastructure contractor…"
          placeholderAr="مقاول معتمد في الكهرباء والتيار الخفيف والبنية التحتية الذكية…" />
        <BiField t={t} label={t.badge}
          valueEn={en('badge')} valueAr={ar('badge')}
          onEn={v => setEn('badge', v)} onAr={v => setAr('badge', v)}
          placeholderEn="Certified Contractor · KSA"
          placeholderAr="مقاول معتمد · المملكة العربية السعودية" />
      </SectionCard>

      {/* B — Column Headings */}
      <SectionCard title={t.sectionB} badge="B" defaultOpen>
        <BiField t={t} label={t.colLinks}
          valueEn={en('col_links')} valueAr={ar('col_links')}
          onEn={v => setEn('col_links', v)} onAr={v => setAr('col_links', v)}
          placeholderEn="Quick Links" placeholderAr="روابط سريعة" />
        <BiField t={t} label={t.colServices}
          valueEn={en('col_services')} valueAr={ar('col_services')}
          onEn={v => setEn('col_services', v)} onAr={v => setAr('col_services', v)}
          placeholderEn="Our Services" placeholderAr="خدماتنا" />
        <BiField t={t} label={t.colContact}
          valueEn={en('col_contact')} valueAr={ar('col_contact')}
          onEn={v => setEn('col_contact', v)} onAr={v => setAr('col_contact', v)}
          placeholderEn="Contact" placeholderAr="تواصل معنا" />
      </SectionCard>

      {/* C — Bottom Bar */}
      <SectionCard title={t.sectionC} badge="C" defaultOpen>
        <BiField t={t} label={t.copyright}
          valueEn={en('copyright')} valueAr={ar('copyright')}
          onEn={v => setEn('copyright', v)} onAr={v => setAr('copyright', v)}
          placeholderEn="BetaVolt Engineering & Contracting. All rights reserved."
          placeholderAr="بيتافولت للهندسة والمقاولات. جميع الحقوق محفوظة." />
        <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-2">{t.copyHint}</p>
      </SectionCard>

      {/* D — Social Media Links */}
      <SectionCard title={t.sectionD} badge="D" defaultOpen>
        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1 pb-1">{t.socialDesc}</p>
        <FieldDivider label={t.divPlatforms} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SocialField t={t} label="LinkedIn"     value={footerContent.social.linkedin}  onChange={v => setSocial('linkedin', v)}  placeholder="https://linkedin.com/company/…" Icon={LinkedInSvg}  />
          <SocialField t={t} label="Twitter / X"  value={footerContent.social.twitter}   onChange={v => setSocial('twitter', v)}   placeholder="https://x.com/…"               Icon={TwitterSvg}   />
          <SocialField t={t} label="Facebook"     value={footerContent.social.facebook}  onChange={v => setSocial('facebook', v)}  placeholder="https://facebook.com/…"        Icon={FacebookSvg}  />
          <SocialField t={t} label="Instagram"    value={footerContent.social.instagram} onChange={v => setSocial('instagram', v)} placeholder="https://instagram.com/…"       Icon={InstagramSvg} />
          <SocialField t={t} label="Snapchat"     value={footerContent.social.snapchat}  onChange={v => setSocial('snapchat', v)}  placeholder="https://snapchat.com/add/…"    Icon={SnapchatSvg}  />
          <SocialField t={t} label="TikTok"       value={footerContent.social.tiktok}    onChange={v => setSocial('tiktok', v)}    placeholder="https://tiktok.com/@…"         Icon={TikTokSvg}    />
          <SocialField t={t} label="YouTube"      value={footerContent.social.youtube}   onChange={v => setSocial('youtube', v)}   placeholder="https://youtube.com/@…"        Icon={YoutubeSvg}   />
          <SocialField t={t} label="WhatsApp"     value={footerContent.social.whatsapp}  onChange={v => setSocial('whatsapp', v)}  placeholder="+966 58 017 8629"             Icon={WhatsAppSvg}  />
        </div>
      </SectionCard>

      {/* Floating save bar */}
      <div className="fixed bottom-0 inset-x-0 lg:ps-64 z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6 flex justify-end pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3">
            <span className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
              {saving ? t.saving : saved ? t.saved : t.saveHint}
            </span>
            <button type="button" onClick={handleSave} disabled={saving}
              className={['inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm disabled:opacity-60 select-none whitespace-nowrap',
                saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'].join(' ')}>
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} strokeWidth={2} />}
              {saving ? t.saving : saved ? t.saved : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
