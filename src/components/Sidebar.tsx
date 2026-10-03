import React from 'react';
import { ActiveView, Language, UserRole } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { ROLE_PROFILES, isViewAllowedForRole } from '../config/permissions';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  language: Language;
  onLogout: () => void;
  unreadAlertsCount?: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
  userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  language,
  onLogout,
  unreadAlertsCount = 0,
  isOpenOnMobile = false,
  onCloseMobile,
  userRole = 'Warehouse Operations Director'
}) => {
  const t = TRANSLATIONS[language];
  const profile = ROLE_PROFILES[userRole] || ROLE_PROFILES['Warehouse Operations Director'];

  interface NavItem {
    id: ActiveView;
    label: string;
    icon: string;
    badge?: number | string;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const allNavGroups: NavGroup[] = [
    {
      title: language === 'hi' ? 'संचालन एवं डिजिटल जुड़वां' : 'Operations & Digital Twin',
      items: [
        { id: 'overview', label: language === 'hi' ? 'डिजिटल जुड़वा दृश्य' : 'Digital Twin twin', icon: 'grid_view' },
        { id: 'warehouse', label: language === 'hi' ? 'वेयरहाउस ग्रिड' : '2D Spatial Map', icon: 'warehouse' },
        { id: 'fleet', label: language === 'hi' ? 'एएमआर फ्लीट' : 'AMR Fleet Manager', icon: 'smart_toy', badge: '6 AMRs' },
        { id: 'tasks', label: language === 'hi' ? 'कार्य आवंटन' : 'Task Dispatcher', icon: 'assignment' }
      ]
    },
    {
      title: language === 'hi' ? 'इंटेलिजेंस एवं एज एआई' : 'Intelligence & Edge AI',
      items: [
        { id: 'coordination', label: language === 'hi' ? 'पाथ प्लानिंग (A*)' : 'Multi-Robot Pathing', icon: 'alt_route' },
        { id: 'edge-ai', label: language === 'hi' ? 'एज परसेप्शन' : 'Edge AI Perception', icon: 'videocam_sensor', badge: '<18ms' },
        { id: 'analytics', label: language === 'hi' ? 'फ्लीट मेट्रिक्स' : 'Fleet Analytics', icon: 'analytics' }
      ]
    },
    {
      title: language === 'hi' ? 'नियंत्रण एवं सिमुलेशन' : 'Controller & System',
      items: [
        { id: 'alerts', label: language === 'hi' ? 'चेतावनी एवं अलार्म' : 'System Alerts', icon: 'notifications', badge: unreadAlertsCount || undefined },
        { id: 'simulation', label: language === 'hi' ? 'न्यायाधीश डेमो नियंत्रक' : 'SIH Judge Demo', icon: 'sports_esports', badge: 'LIVE' },
        { id: 'settings', label: language === 'hi' ? 'प्रणाली सेटिंग्स' : 'NEXUS Settings', icon: 'settings' }
      ]
    }
  ];

  // Filter nav groups by role permissions
  const safeRole: UserRole = (userRole as UserRole) || 'Warehouse Operations Director';
  const navGroups: NavGroup[] = allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isViewAllowedForRole(item.id, safeRole))
    }))
    .filter((group) => group.items.length > 0);

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Apple-Style Sidebar Dock */}
      <aside
        className={`bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-2xl w-[260px] h-screen fixed left-0 top-0 border-r border-slate-800 flex flex-col z-50 select-none transition-transform duration-300 ease-in-out ${
          isOpenOnMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="material-symbols-outlined text-white text-[20px]">precision_manufacturing</span>
            </div>
            <div>
              <h1 className="font-semibold text-[14px] leading-tight text-white tracking-tight flex items-center gap-1.5">
                <span>NEXUS AMR</span>
                <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded font-bold">
                  OS 2.6
                </span>
              </h1>
              <p className="text-[10.5px] text-slate-400 font-normal">
                {language === 'hi' ? 'स्वायत्त फ्लीट प्लेटफॉर्म' : 'Autonomous Fleet Control'}
              </p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close navigation"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-cyan-500/50 ring-1 ring-cyan-500/20 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-white font-semibold truncate">
                {language === 'hi' ? profile.nameHi : profile.name}
              </p>
              <p className="text-[10px] text-cyan-400 font-medium truncate">
                {language === 'hi' ? profile.titleHi : profile.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>

        {/* Grouped Navigation List */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 flex flex-col gap-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                {group.title}
              </div>

              {group.items.map((item) => {
                const isActive = activeView === item.id || (activeView === 'overview' && item.id === 'warehouse');
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-200 text-xs font-medium cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full shrink-0 font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Ambient Footer Info */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-slate-200">
                {language === 'hi' ? '6 एएमआर ऑनलाइन' : '6 AMRs Online'}
              </span>
            </div>
            <span className="font-mono text-[9.5px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Mesh Active
            </span>
          </div>

          <div className="bg-slate-900 rounded-lg px-2.5 py-1.5 text-[10.5px] text-slate-400 flex items-center justify-between border border-slate-800">
            <span>{language === 'hi' ? 'एज लेटेंसी:' : 'Edge Latency:'}</span>
            <span className="font-mono font-semibold text-cyan-400">14.2 ms</span>
          </div>
        </div>
      </aside>
    </>
  );
};
