import React from 'react';
import { Language, ActiveView } from '../types';
import { ASSETS } from '../data/mockData';

interface BelFooterProps {
  language: Language;
  onNavigate?: (view: ActiveView, filterParam?: string) => void;
  onOpenAiCopilot?: () => void;
}

export const BelFooter: React.FC<BelFooterProps> = ({
  language,
  onNavigate,
  onOpenAiCopilot
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full border-t border-black/10 dark:border-white/10 bg-gradient-to-b from-slate-100/90 via-slate-100 to-slate-200/90 dark:from-[#161617] dark:via-[#111112] dark:to-black text-slate-800 dark:text-slate-200 select-none">
      {/* Top Sovereign Tricolor Accent Bar */}
      <div className="h-[3px] tricolor-ribbon w-full"></div>

      {/* Main Footer Container */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 py-12 flex flex-col gap-12">
        {/* Row 1: Brand, PSU Identity, Address & Mission Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Col 1: Emblem & BEL Corporate Details */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={ASSETS.emblem}
                alt="Government of India Emblem"
                className="h-12 w-auto object-contain brightness-105"
              />
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-tight">
                  {language === 'hi' ? 'भारत इलेक्ट्रॉनिक्स लिमिटेड' : 'Bharat Electronics Limited'}
                </h3>
                <p className="text-[11px] font-semibold text-[#0071E3] font-mono tracking-wide">
                  {language === 'hi'
                    ? 'रक्षा मंत्रालय, भारत सरकार के अधीन एक नवरत्न उद्यम'
                    : 'A Navratna PSU under Ministry of Defence, Govt of India'}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#86868b] leading-relaxed">
              {language === 'hi'
                ? 'NEXUS AMR OS: भारत इलेक्ट्रॉनिक्स लिमिटेड (BEL) और स्मार्ट इंडिया हैकाथॉन (SIH26123) के लिए निर्मित स्वायत्त मोबाइल रोबोट ऑपरेटिंग सिस्टम। सब-18ms एज AI विज़न और A* पाथ समन्वय द्वारा संचालित।'
                : 'NEXUS AMR OS: Next-Generation Autonomous Mobile Robot Operating System & Real-Time Warehouse Telemetry Mesh engineered for Bharat Electronics Limited (BEL) and Smart India Hackathon (SIH26123). Powered by Sub-18ms Edge AI vision, distributed A* spatial path coordination, and multi-criteria task allocation scoring.'}
            </p>

            {/* Corporate Office Address Box */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs flex flex-col gap-1">
              <span className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                {language === 'hi' ? 'पंजीकृत एवं कॉर्पोरेट कार्यालय' : 'Corporate & Registered Office'}
              </span>
              <p className="text-[#86868b] text-[11px]">
                Outer Ring Road, Nagavara, Bengaluru - 560045, Karnataka, India
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-[#86868b] mt-1 pt-1 border-t border-black/5 dark:border-white/5">
                <span>CIN: L32309KA1954GOI000787</span>
                <span>•</span>
                <span>ISO 9001 / ISO 27001</span>
              </div>
            </div>
          </div>

          {/* Col 2: BEL Strategic Capabilities & Business Verticals */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
              {language === 'hi' ? 'रणनीतिक उत्पाद एवं प्रणालियां' : 'BEL Strategic Portfolios'}
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-[#86868b]">
              <li>
                <a
                  href="https://bel-india.in/products/radars/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">radar</span>
                  <span>Defense Radars & Weapon Systems</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bel-india.in/homepage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">location_city</span>
                  <span>AI Smart City & ITMS Systems</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bel-india.in/products/homeland-security/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">security</span>
                  <span>Homeland Security & Border Surveillance</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bel-india.in/products/software-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  <span>Software Technology & Cyber Defense</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bel-india.in/products/clean-energy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">electric_bolt</span>
                  <span>Clean Energy, Solar & EV Mobility</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: BEL Official Portals & Investor / Citizen Links */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
              {language === 'hi' ? 'आधिकारिक पोर्टल एवं नीतियां' : 'Official BEL Portals & RTI'}
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-[#86868b]">
              <li>
                <a
                  href="https://bel-india.in/about-us/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center justify-between"
                >
                  <span>About Bharat Electronics</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bel-india.in/investors/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center justify-between"
                >
                  <span>Investor Relations & Financials</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bel-india.in/careers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center justify-between"
                >
                  <span>Careers & Recruitment</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bel-india.in/rti/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center justify-between"
                >
                  <span>Right to Information (RTI Act)</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              </li>
              <li>
                <a
                  href="https://eprocurebel.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] transition-colors flex items-center justify-between"
                >
                  <span>BEL E-Procurement & GeM Portal</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Sovereign Helpdesk, Partners & Quick AI Launcher */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]"></span>
              {language === 'hi' ? 'नागरिक सहायता' : 'Civic Helpline'}
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <span className="text-[10px] text-[#86868b] block font-mono">Toll-Free Control Room</span>
                <strong className="text-xs sm:text-sm font-bold text-[#0071E3] font-mono block mt-0.5">
                  1800-11-NAGAR
                </strong>
                <span className="text-[10px] text-[#86868b] block mt-1">24/7 Transit Incident Command</span>
              </div>

              {onOpenAiCopilot && (
                <button
                  type="button"
                  onClick={onOpenAiCopilot}
                  className="w-full py-2 px-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                  <span>{language === 'hi' ? 'नगर AI कॉपायलट' : 'Ask Nagar AI'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Ministry & Stakeholder Badges Strip */}
        <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[#86868b] text-[11px] font-mono">
            <span className="font-bold text-slate-900 dark:text-white">Partner Agencies:</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">Ministry of Defence</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">Ministry of Housing & Urban Affairs</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">Delhi Transport Corporation (DTC)</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">PWD & MCD Delhi</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 font-mono">
              ✓ Atmanirbhar Bharat Initiative
            </span>
          </div>
        </div>

        {/* Row 3: Copyright, Legal Disclaimer & STQC Compliance */}
        <div className="pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#86868b]">
          <p>
            © {currentYear} <strong>Bharat Electronics Limited (BEL)</strong> & <strong>Government of India</strong>. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://bel-india.in/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0071E3] transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="https://bel-india.in/terms-of-use/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0071E3] transition-colors"
            >
              Terms of Use
            </a>
            <span>•</span>
            <a
              href="https://bel-india.in/hyperlinking-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0071E3] transition-colors"
            >
              Hyperlink Policy
            </a>
            <span>•</span>
            <a
              href="https://bel-india.in/disclaimer/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0071E3] transition-colors"
            >
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
