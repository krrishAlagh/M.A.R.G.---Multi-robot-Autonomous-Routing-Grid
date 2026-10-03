import React, { useState, useRef, useEffect } from 'react';
import { Language, ActiveView, Theme, UserRole } from '../types';
import { ROLE_PROFILES } from '../config/permissions';

interface TopHeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout?: () => void;
  isConnected?: boolean;
  latestAlert?: { message: string; severity: string } | null;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  audioMuted?: boolean;
  onToggleAudioMute?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  language,
  onToggleLanguage,
  searchTerm,
  onSearchChange,
  onNotificationsClick,
  onProfileClick,
  activeView,
  setActiveView,
  onLogout,
  isConnected = true,
  userRole = 'Warehouse Operations Director',
  onRoleChange,
  audioMuted = false,
  onToggleAudioMute
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const currentRole: UserRole = (userRole as UserRole) || 'Warehouse Operations Director';
  const roleProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES['Warehouse Operations Director'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles: Record<ActiveView, { en: string; hi: string }> = {
    overview: { en: 'Warehouse Digital Twin', hi: 'वेयरहाउस डिजिटल जुड़वा' },
    warehouse: { en: '2D Spatial Map', hi: '2D स्थानिक मानचित्र' },
    fleet: { en: 'AMR Fleet Manager', hi: 'एएमआर फ्लीट मैनेजर' },
    tasks: { en: 'Dynamic Task Allocation', hi: 'गतिशील कार्य आवंटन' },
    coordination: { en: 'Multi-Robot Pathing (A*)', hi: 'मल्टी-रोबोट पाथ प्लानिंग' },
    'edge-ai': { en: 'Edge AI Perception vs Central HQ', hi: 'एज एआई परसेप्शन बनाम सेंट्रल HQ' },
    alerts: { en: 'Operational Alerts & E-Stops', hi: 'ऑपरेशनल अलर्ट और ई-स्टॉप' },
    analytics: { en: 'Warehouse Throughput Analytics', hi: 'वेयरहाउस थ्रूपुट विश्लेषण' },
    simulation: { en: 'SIH Judge Scenario Controller', hi: 'एसआईएच जज परिदृश्य नियंत्रक' },
    'api-explorer': { en: 'API Playground & OpenAPI', hi: 'एपीआई प्लेग्राउंड एवं ओपनएपीआई' },
    settings: { en: 'System Settings & Nodes', hi: 'सिस्टम सेटिंग्स' },
    login: { en: 'Login Portal', hi: 'लॉगिन पोर्टल' }
  };

  const availableRoles: UserRole[] = [
    'Warehouse Operations Director',
    'Fleet Systems Engineer',
    'Safety & Edge AI Specialist',
    'Warehouse Floor Supervisor'
  ];

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-40 sticky top-0 shrink-0 select-none">
      {/* Left Title & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">NEXUS AMR OS</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            {language === 'hi' ? viewTitles[activeView]?.hi : viewTitles[activeView]?.en}
          </h2>
        </div>

        {/* Realtime WebSocket Connection Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-[10.5px]">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="font-mono text-slate-300 font-medium">
            {isConnected ? '18ms mesh' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Middle Search Input */}
      <div className="hidden lg:flex items-center relative max-w-xs w-full">
        <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={language === 'hi' ? 'एएमआर, स्टेशन या टास्क खोजें...' : 'Search AMR ID, task or station...'}
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all font-mono"
        />
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Toggle */}
        <button
          type="button"
          onClick={onToggleLanguage}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-medium border border-slate-700 transition-colors cursor-pointer"
          title="Toggle Language"
        >
          {language === 'en' ? 'EN | हिंदी' : 'हिंदी | EN'}
        </button>

        {/* Audio Mute Toggle */}
        {onToggleAudioMute && (
          <button
            type="button"
            onClick={onToggleAudioMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {audioMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
        )}

        {/* Notifications Icon */}
        <button
          type="button"
          onClick={onNotificationsClick}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors relative cursor-pointer"
          title="Operational Alerts"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
        </button>

        {/* Role Selector Dropdown */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
          >
            <img
              src={roleProfile.avatar}
              alt={roleProfile.name}
              className="w-6 h-6 rounded-full object-cover border border-cyan-500/50"
            />
            <span className="text-xs text-slate-200 font-medium hidden md:inline truncate max-w-[120px]">
              {language === 'hi' ? roleProfile.nameHi : roleProfile.name}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-[16px]">
              {isRoleDropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Switch Persona / Role</p>
              </div>
              <div className="space-y-1">
                {availableRoles.map((r) => {
                  const prof = ROLE_PROFILES[r];
                  const isCurrent = r === currentRole;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => {
                        if (onRoleChange) onRoleChange(r);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <img src={prof.avatar} alt={prof.name} className="w-7 h-7 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{language === 'hi' ? prof.nameHi : prof.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{language === 'hi' ? prof.titleHi : prof.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={onProfileClick}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">settings</span>
                  Settings
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">logout</span>
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
