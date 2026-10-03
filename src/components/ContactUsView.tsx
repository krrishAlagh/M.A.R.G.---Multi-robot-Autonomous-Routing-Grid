import React, { useState } from 'react';
import { Language, UserRole } from '../types';

interface ContactUsViewProps {
  language: Language;
  userRole: UserRole;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({ language, userRole }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Critical E-Stop & Safety');
  const [message, setMessage] = useState('');
  const [ticketToast, setTicketToast] = useState<string | null>(null);

  const isHi = language === 'hi';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `BEL-TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketToast(`Ticket ${ticketId} created! Support team will respond in < 15 mins.`);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setTicketToast(null), 5000);
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1440px] mx-auto select-none font-sans">
      
      {/* ── Top Header Banner ── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 bg-[#0a0a0f] p-6 sm:p-10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
                24/7 SUPPORT & COMMAND HQ
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full">
                SIH26123
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isHi ? 'संपर्क करें एवं सहायता केंद्र' : 'NEXUS AMR OS Support & Command HQ'}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Direct technical escalation desk for Bharat Electronics Limited (BEL), Smart India Hackathon evaluators, and warehouse floor operations supervisors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <span className="material-symbols-outlined text-[20px] animate-pulse">call</span>
              </div>
              <div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase">24/7 EMERGENCY HOTLINE</div>
                <div className="text-sm font-bold text-white font-mono">+91 1800-NEXUS-AMR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ticketToast && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold rounded-2xl flex items-center gap-2 shadow-xl animate-bounce">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          {ticketToast}
        </div>
      )}

      {/* ── Direct Emergency Dispatch Hotline Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-[#0e0e13] border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-neutral-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <span className="material-symbols-outlined text-[20px]">headset_mic</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Central Operations Desk</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Fleet routing, task scheduling, and supervisor escalation.</p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-xs font-mono text-sky-400">
            📞 +91 (080) 2838-5000 | ops@nexus-amr.bel.gov.in
          </div>
        </div>

        <div className="bg-[#0e0e13] border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-neutral-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <span className="material-symbols-outlined text-[20px]">memory</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Edge AI & Robotics Core</h3>
            <p className="text-xs text-neutral-400 mt-0.5">YOLOv8 TensorRT vision, LiDAR calibration & A* path engine.</p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-xs font-mono text-purple-400">
            📧 edge-ai@nexus-amr.bel.gov.in
          </div>
        </div>

        <div className="bg-[#0e0e13] border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-neutral-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[20px]">hardware</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Hardware & Charging Bays</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Li-Ion battery replacement, drive motor overhaul, wireless dock C1.</p>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-xs font-mono text-amber-400">
            🛠️ maintenance@nexus-amr.bel.gov.in
          </div>
        </div>

      </div>

      {/* ── Main Layout: Contact Form & BEL Headquarters Location ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Support Ticket Submission Form */}
        <div className="bg-[#0e0e13] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-400">mail</span>
              Submit Support Inquiry / Emergency Ticket
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Direct ticket logging into NEXUS AMR OS central dispatch system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-medium text-neutral-300 mb-1">Full Name / Operator ID:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Malhotra (Operations Lead)"
                className="w-full bg-[#141419] border border-neutral-800 rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">Official Email Address:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@nexus-amr.bel.gov.in"
                className="w-full bg-[#141419] border border-neutral-800 rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">Issue Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#141419] border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500/50"
              >
                <option value="Critical E-Stop & Safety">Critical E-Stop & Safety Interlock</option>
                <option value="Task Allocation Scoring">Task Allocation Scoring Query</option>
                <option value="Edge AI Object Detection">Edge AI Object Detection Calibration</option>
                <option value="Multi-Robot Conflict">Multi-Robot A* Route Deadlock</option>
                <option value="SIH26123 Evaluation">SIH26123 Hackathon Judge Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">Detailed Description:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Provide details regarding the system query, AMR code, or aisle location..."
                className="w-full bg-[#141419] border border-neutral-800 rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <span>Submit Ticket</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>

        {/* Headquarters & Command Center Location Info */}
        <div className="bg-[#0e0e13] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">location_on</span>
                BEL R&D Headquarters & SIH Command Center
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Central Research Laboratory (CRL) Autonomous Systems Division.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs text-neutral-300">
              <div className="p-3 bg-[#141419] border border-neutral-800 rounded-xl">
                <span className="text-[10px] text-neutral-500 block">HEADQUARTERS ADDRESS</span>
                <span className="font-bold text-white mt-0.5 block">
                  Bharat Electronics Limited (BEL)<br />
                  Central Research Laboratory, Jalahalli Post<br />
                  Bengaluru - 560013, Karnataka, India
                </span>
              </div>

              <div className="p-3 bg-[#141419] border border-neutral-800 rounded-xl">
                <span className="text-[10px] text-neutral-500 block">COMMAND CENTER TELEMETRY SERVER</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">
                  Host: nexus-amr.bel.gov.in (Port 5005 / WS)
                </span>
              </div>
            </div>

            {/* Photo Card */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-neutral-800 group">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                alt="BEL Command Center"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e13] via-transparent to-black/30" />
              <span className="absolute top-3 left-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                ● BEL CRL COMMAND CENTER
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-[11px] font-mono text-neutral-400 text-center">
            Role Persona Logged: <strong>{userRole}</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
