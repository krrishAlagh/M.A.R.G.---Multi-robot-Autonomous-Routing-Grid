import React, { useState, useRef, useEffect } from 'react';
import { ActiveView, Language, UserRole, Theme } from '../types';
import { ROLE_PROFILES, isViewAllowedForRole } from '../config/permissions';

interface NavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  isConnected: boolean;
  unreadAlertsCount: number;
  audioMuted: boolean;
  onToggleAudioMute: () => void;
  latestEvent?: { type: string; message: string; timestamp: string } | null;
}

interface NavItem {
  id: ActiveView;
  label: string;
  labelHi: string;
  icon: string;
  badge?: string;
  shortcut?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: 'dashboard', shortcut: '⌘D' },
  { id: 'overview', label: 'Digital Twin', labelHi: 'डिजिटल ट्विन', icon: 'grid_view', shortcut: '⌘1' },
  { id: 'fleet', label: 'AMR Fleet', labelHi: 'एएमआर फ्लीट', icon: 'smart_toy', badge: '6', shortcut: '⌘2' },
  { id: 'tasks', label: 'Task Allocator', labelHi: 'कार्य आवंटन', icon: 'assignment', shortcut: '⌘3' },
  { id: 'coordination', label: 'Multi-Robot', labelHi: 'पाथ योजना', icon: 'alt_route', badge: 'A*', shortcut: '⌘4' },
  { id: 'edge-ai', label: 'Edge AI Vision', labelHi: 'एज एआई', icon: 'videocam_sensor', badge: '<15ms', shortcut: '⌘5' },
  { id: 'analytics', label: 'Analytics', labelHi: 'आंकड़े', icon: 'analytics', shortcut: '⌘6' },
  { id: 'simulation', label: 'Judge Demo', labelHi: 'जज डेमो', icon: 'sports_esports', badge: 'Live', shortcut: '⌘7' },
  { id: 'alerts', label: 'Alerts', labelHi: 'अलर्ट', icon: 'notifications', shortcut: '⌘8' },
  { id: 'settings', label: 'Settings', labelHi: 'सेटिंग्स', icon: 'settings', shortcut: '⌘9' }
];

export const NavBar: React.FC<NavBarProps> = ({
  activeView,
  setActiveView,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  userRole,
  onRoleChange,
  onLogout,
  isConnected,
  unreadAlertsCount,
  audioMuted,
  onToggleAudioMute,
  latestEvent
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

  const profile = ROLE_PROFILES[userRole] || ROLE_PROFILES['Warehouse Operations Director'];
  const availableRoles = Object.keys(ROLE_PROFILES) as UserRole[];

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const key = e.key;
        if (key === '1') { e.preventDefault(); setActiveView('overview'); }
        else if (key === '2') { e.preventDefault(); setActiveView('fleet'); }
        else if (key === '3') { e.preventDefault(); setActiveView('tasks'); }
        else if (key === '4') { e.preventDefault(); setActiveView('coordination'); }
        else if (key === '5') { e.preventDefault(); setActiveView('edge-ai'); }
        else if (key === '6') { e.preventDefault(); setActiveView('analytics'); }
        else if (key === '7') { e.preventDefault(); setActiveView('simulation'); }
        else if (key === '8') { e.preventDefault(); setActiveView('alerts'); }
        else if (key === '9') { e.preventDefault(); setActiveView('settings'); }
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [setActiveView]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNavItem = (view: ActiveView) => {
    if (isViewAllowedForRole(view, userRole)) {
      setActiveView(view);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 select-none border-b transition-colors ${
        isDark
          ? 'bg-[#09090b]/90 border-neutral-800 text-neutral-100'
          : 'bg-white/90 border-neutral-200 text-neutral-900'
      }`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* ── ROW 1: MINIMAL SYSTEM HEADER ── */}
      <div className={`h-11 px-4 max-w-[1440px] mx-auto flex items-center justify-between border-b text-xs ${
        isDark ? 'border-neutral-800/60' : 'border-neutral-200/60'
      }`}>
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavItem('overview')}
            className="flex items-center gap-2 font-bold tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[11px] ${
              isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white'
            }`}>
              NX
            </div>
            <span className="text-[14px]">NEXUS AMR OS</span>
          </button>

          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
          }`}>
            SIH26123
          </span>

          {/* Live Event Ticker */}
          {latestEvent && (
            <div className="hidden lg:flex items-center gap-2 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[11px] truncate max-w-[320px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
              <span className="truncate">{latestEvent.message}</span>
            </div>
          )}
        </div>

        {/* Right: Controls & Persona */}
        <div className="flex items-center gap-2">

          {/* WS Connection Pill */}
          <div className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{isConnected ? '14.2ms' : 'Offline'}</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
            }`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className={`px-2 py-0.5 rounded border text-[11px] font-mono font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
            }`}
          >
            {language === 'en' ? 'EN' : 'हिं'}
          </button>

          {/* Audio Siren Toggle */}
          <button
            onClick={onToggleAudioMute}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
            }`}
            title={audioMuted ? 'Unmute alerts' : 'Mute alerts'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {audioMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Alert Bell */}
          <button
            onClick={() => handleNavItem('alerts')}
            className={`relative p-1.5 rounded transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">notifications</span>
            {unreadAlertsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200'
              }`}
            >
              <img src={profile.avatar} alt={profile.name} className="w-4 h-4 rounded-full object-cover" />
              <span className="truncate max-w-[90px]">{profile.badge}</span>
              <span className="material-symbols-outlined text-[12px] opacity-60">expand_more</span>
            </button>

            {roleMenuOpen && (
              <div
                className={`absolute right-0 top-[calc(100%+6px)] w-60 rounded-lg shadow-xl border z-50 p-1 space-y-1 ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                    : 'bg-white border-neutral-200 text-neutral-900'
                }`}
              >
                <div className="px-3 py-2 border-b border-neutral-800/60">
                  <p className="text-[10px] font-mono opacity-60 uppercase">Role Persona</p>
                  <p className="text-xs font-semibold mt-0.5">{profile.name}</p>
                </div>
                {availableRoles.map((r) => {
                  const p = ROLE_PROFILES[r];
                  const isCur = r === userRole;
                  return (
                    <button
                      key={r}
                      onClick={() => { onRoleChange(r); setRoleMenuOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 text-xs transition-colors cursor-pointer ${
                        isCur
                          ? isDark ? 'bg-white/10 font-semibold text-white' : 'bg-black/10 font-semibold text-black'
                          : isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                      <span className="truncate flex-1">{p.badge}</span>
                    </button>
                  );
                })}
                <div className="pt-1 border-t border-neutral-800/60">
                  <button
                    onClick={onLogout}
                    className="w-full py-1 text-center text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── ROW 2: CLEAN MINIMAL TABS BAR (Linear / Vercel style) ── */}
      <div className="h-11 max-w-[1440px] mx-auto px-4 flex items-center gap-1.5">
        <button
          onClick={() => scrollTabs('left')}
          className={`p-1 rounded cursor-pointer transition-colors ${
            isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-900' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {ALL_NAV_ITEMS.map((item) => {
            const isCur = activeView === item.id;
            const allowed = isViewAllowedForRole(item.id, userRole);

            return (
              <button
                key={item.id}
                onClick={() => allowed && handleNavItem(item.id)}
                disabled={!allowed}
                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                  isCur
                    ? isDark
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-neutral-900 text-white font-semibold shadow-sm'
                    : allowed
                      ? isDark
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                      : 'opacity-30 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                <span>{isHi ? item.labelHi : item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1 rounded ${
                    isCur
                      ? isDark ? 'bg-black/15 text-black' : 'bg-white/20 text-white'
                      : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollTabs('right')}
          className={`p-1 rounded cursor-pointer transition-colors ${
            isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-900' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

    </header>
  );
};
