import React from 'react';
import { Language, ActiveView } from '../types';

interface BelFooterProps {
  language: Language;
  onNavigate?: (view: ActiveView) => void;
}

export const BelFooter: React.FC<BelFooterProps> = ({ language, onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const isHi = language === 'hi';

  const navLinks: { label: string; labelHi: string; view: ActiveView; icon: string }[] = [
    { label: 'Dashboard', labelHi: 'डैशबोर्ड', view: 'dashboard', icon: 'dashboard' },
    { label: 'Digital Twin', labelHi: 'डिजिटल ट्विन', view: 'overview', icon: 'grid_view' },
    { label: 'AMR Fleet', labelHi: 'एएमआर फ्लीट', view: 'fleet', icon: 'smart_toy' },
    { label: 'Task Allocator', labelHi: 'कार्य आवंटन', view: 'tasks', icon: 'assignment' },
    { label: 'Edge AI Vision', labelHi: 'एज एआई', view: 'edge-ai', icon: 'videocam_sensor' },
    { label: 'Analytics', labelHi: 'आंकड़े', view: 'analytics', icon: 'analytics' },
  ];

  const belLinks = [
    { label: 'About BEL', href: 'https://bel-india.in/about-us/' },
    { label: 'Investor Relations', href: 'https://bel-india.in/investors/' },
    { label: 'Careers', href: 'https://bel-india.in/careers/' },
    { label: 'E-Procurement', href: 'https://eprocurebel.co.in' },
    { label: 'Privacy Policy', href: 'https://bel-india.in/privacy-policy/' },
    { label: 'RTI Act', href: 'https://bel-india.in/rti/' },
  ];

  return (
    <footer className="mt-20 w-full border-t border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#09090b] text-neutral-600 dark:text-neutral-400 select-none">

      {/* Indian Tricolor accent line — 3px at the very top of footer */}
      <div className="w-full flex h-[3px]">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white dark:bg-neutral-700" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Main body */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-neutral-200 dark:border-neutral-800">

          {/* Brand column */}
          <div className="flex flex-col gap-4">
            {/* Logo row */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[13px] font-black bg-neutral-900 dark:bg-white text-white dark:text-black">
                NX
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">NEXUS AMR OS</div>
                <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500">SIH26123 · BEL</div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-500 max-w-[260px]">
              {isHi
                ? 'भारत इलेक्ट्रॉनिक्स लिमिटेड के लिए निर्मित नेक्स्ट-जेन स्वायत्त वेयरहाउस इंटेलिजेंस प्लेटफॉर्म।'
                : 'Next-gen Autonomous Warehouse Intelligence Platform engineered for Bharat Electronics Limited under Smart India Hackathon SIH26123.'}
            </p>

            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2">
              {['Navratna PSU', 'ISO 9001', 'Atmanirbhar Bharat'].map((b) => (
                <span
                  key={b}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border bg-neutral-100 border-neutral-200 text-neutral-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Platform navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-mono">
              {isHi ? 'प्लेटफॉर्म' : 'Platform'}
            </h4>
            <ul className="grid grid-cols-2 gap-1.5">
              {navLinks.map((l) => (
                <li key={l.view}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(l.view)}
                    className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-[13px] text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      {l.icon}
                    </span>
                    {isHi ? l.labelHi : l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* BEL official links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-mono">
              {isHi ? 'भारत इलेक्ट्रॉनिक्स लिमिटेड' : 'Bharat Electronics Limited'}
            </h4>
            <ul className="flex flex-col gap-1.5">
              {belLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                  >
                    <span>{l.label}</span>
                    <span className="material-symbols-outlined text-[12px] opacity-40 group-hover:opacity-100 transition-opacity">
                      open_in_new
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
              <div className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600">
                {isHi ? 'कॉर्पोरेट कार्यालय' : 'Corporate Office'}
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
                Outer Ring Road, Nagavara,<br />Bengaluru - 560045, Karnataka, India
              </div>
              <div className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600 mt-1">
                CIN: L32309KA1954GOI000787
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p className="text-neutral-500 dark:text-neutral-600">
            © {currentYear}{' '}
            <span className="text-neutral-700 dark:text-neutral-400 font-semibold">Bharat Electronics Limited</span>
            {' '}&amp;{' '}
            <span className="text-neutral-700 dark:text-neutral-400 font-semibold">Government of India</span>.{' '}
            All Rights Reserved.
          </p>

          <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-600">
            {['Privacy Policy', 'Terms of Use', 'Disclaimer'].map((t, i, arr) => (
              <React.Fragment key={t}>
                <a
                  href={`https://bel-india.in/${t.toLowerCase().replace(/ /g, '-')}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {t}
                </a>
                {i < arr.length - 1 && <span className="text-neutral-300 dark:text-neutral-800">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
