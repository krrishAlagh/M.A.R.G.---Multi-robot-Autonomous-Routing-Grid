import React, { useState } from 'react';
import { UserRole, Language, Theme } from '../types';
import { 
  Bot, 
  Cpu, 
  Eye, 
  ClipboardList, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { ROLE_PROFILES } from '../config/permissions';

interface LoginViewProps {
  language: Language;
  onToggleLanguage: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  onLogin: (role: UserRole) => void;
}

const ROLE_ICONS: Record<UserRole, any> = {
  'Warehouse Operations Director': Bot,
  'Fleet Systems Engineer': Cpu,
  'Safety & Edge AI Specialist': Eye,
  'Warehouse Floor Supervisor': ClipboardList
};

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onToggleLanguage,
  onLogin
}) => {
  const isHi = language === 'hi';
  const roles = Object.keys(ROLE_PROFILES) as UserRole[];
  const [selectedRole, setSelectedRole] = useState<UserRole>('Warehouse Operations Director');

  const activeProfile = ROLE_PROFILES[selectedRole] || ROLE_PROFILES['Warehouse Operations Director'];
  const [serviceId, setServiceId] = useState(activeProfile.id);
  const [password, setPassword] = useState(activeProfile.passkey);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const prof = ROLE_PROFILES[role];
    if (prof) {
      setServiceId(prof.id);
      setPassword(prof.passkey);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 select-none overflow-x-hidden">
      {/* Left Brand Panel */}
      <div className="lg:w-1/2 bg-slate-900 border-r border-slate-800 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                SIH26123 Smart Warehouse Solution
              </div>
              <div className="text-xs font-medium text-slate-400">
                Distributed Autonomous Mobile Robot Fleet Engine
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {isHi ? 'एज एआई + सेंट्रल ए* ऑकेस्ट्रेशन' : 'Sub-18ms Edge AI + Central A* Grid'}
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              M.A.R.G. <span className="text-cyan-400 font-mono text-2xl lg:text-3xl block lg:inline">OS 2.6</span>
            </h1>
          </div>

          <p className="text-sm lg:text-base text-slate-300 max-w-lg leading-relaxed font-normal">
            {isHi
              ? 'स्वायत्त मोबाइल रोबोटों (AMR) के लिए एज-एआई आधारित वितरित फ्लीट समन्वय, A* पाथ प्लानिंग, और वास्तविक समय डिजिटल जुड़वां प्लेटफॉर्म।'
              : 'Edge-AI Distributed Fleet Coordination for Autonomous Mobile Robots in Smart Warehouses with dynamic task allocation scoring, A* grid navigation, and Sub-18ms obstacle e-stops.'}
          </p>
        </div>

        {/* Quick Role Select Buttons */}
        <div className="relative z-10 pt-8 mt-6 border-t border-slate-800 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHi ? 'एक-क्लिक त्वरित भूमिका प्रवेश' : 'One-Click Quick Persona Login'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {roles.map((r) => {
              const prof = ROLE_PROFILES[r];
              const Icon = ROLE_ICONS[r] || Bot;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onLogin(r)}
                  className="group p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-all text-left flex flex-col justify-between hover:border-cyan-500/60 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9.5px] font-mono text-slate-400 group-hover:text-cyan-300">Quick Access</span>
                  </div>
                  <span className="text-xs font-semibold text-white mt-2 truncate block">
                    {isHi ? prof.nameHi : prof.name}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono block">{prof.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-950">
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center bg-slate-900 p-1 rounded-full border border-slate-800 text-xs font-semibold text-slate-300"
          >
            <span className={`px-3 py-1 rounded-full transition-all ${language === 'en' ? 'bg-cyan-500 text-white' : ''}`}>
              EN
            </span>
            <span className={`px-3 py-1 rounded-full transition-all ${language === 'hi' ? 'bg-cyan-500 text-white' : ''}`}>
              हिंदी
            </span>
          </button>
        </div>

        <div className="w-full max-w-lg bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{isHi ? 'सुरक्षित प्रमाणीकरण' : 'Warehouse OS Authentication'}</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {isHi ? 'M.A.R.G. में साइन इन करें' : 'Sign In to M.A.R.G. - Multi-robot Autonomous Routing Grid'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your persona to auto-populate credentials for SIH evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select Persona Profile
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roles.map((r) => {
                  const prof = ROLE_PROFILES[r];
                  const Icon = ROLE_ICONS[r] || Bot;
                  const isSelected = selectedRole === r;
                  return (
                    <div
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500/30'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate text-white">
                            {isHi ? prof.nameHi : prof.name}
                          </span>
                          <span className="text-[10px] text-cyan-400 block font-mono">{prof.badge}</span>
                        </div>
                      </div>

                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-cyan-400">
                <span>{activeProfile.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeProfile.id}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {isHi ? activeProfile.descHi : activeProfile.descEn}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">System User ID</label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full p-3 bg-slate-950 text-white rounded-xl border border-slate-800 focus:ring-1 focus:ring-cyan-500 outline-none text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Security Passkey</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-950 text-white rounded-xl border border-slate-800 focus:ring-1 focus:ring-cyan-500 outline-none text-xs font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
            >
              <span>{isHi ? `${selectedRole} के रूप में प्रवेश करें` : `Enter M.A.R.G.`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
