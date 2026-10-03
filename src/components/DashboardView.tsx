import React, { useState, useEffect } from 'react';
import { AMR, WarehouseTask, RobotRouteConflict, OperationalAlert, FleetMetrics, Language, ActiveView } from '../types';

interface DashboardViewProps {
  language: Language;
  amrs: AMR[];
  tasks: WarehouseTask[];
  conflicts: RobotRouteConflict[];
  alerts: OperationalAlert[];
  metrics: FleetMetrics;
  isConnected: boolean;
  onNavigate: (view: ActiveView) => void;
  onSelectAmr: (id: string) => void;
}

// ─── Live Clock ───────────────────────────────────────────
const LiveClock: React.FC = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const hh = t.getHours().toString().padStart(2, '0');
  const mm = t.getMinutes().toString().padStart(2, '0');
  const ss = t.getSeconds().toString().padStart(2, '0');
  return (
    <span className="font-mono tabular-nums">
      <span className="text-white">{hh}:{mm}</span>
      <span className="text-neutral-500">:{ss}</span>
    </span>
  );
};

// ─── Sparkline ─────────────────────────────────────────────
const Sparkline: React.FC<{ values: number[]; color: string; height?: number }> = ({ values, color, height = 36 }) => {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 120; const H = height;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * (H - 6) - 3}`).join(' ');
  const fillPts = `0,${H} ${pts} ${W},${H}`;
  const uid = color.replace(/[^a-z0-9]/gi, '');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {(() => {
        const last = values[values.length - 1];
        const x = W;
        const y = H - ((last - min) / range) * (H - 6) - 3;
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
};

// ─── Mini Digital Twin Map ────────────────────────────────
const MiniMap: React.FC<{ amrs: AMR[]; onClick: () => void }> = ({ amrs, onClick }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 200); return () => clearInterval(iv); }, []);
  return (
    <div className="relative w-full h-full cursor-pointer group" onClick={onClick}>
      <svg viewBox="0 0 50 50" className="w-full h-full rounded-xl"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, #0a0e1a 0%, #060608 100%)' }}>
        <defs>
          <pattern id="mmpg" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="50" height="50" fill="url(#mmpg)" />
        {/* Main aisle */}
        <rect x="0" y="22" width="50" height="6" fill="rgba(56,189,248,0.03)" />
        <line x1="0" y1="22" x2="50" y2="22" stroke="rgba(234,179,8,0.2)" strokeWidth="0.15" strokeDasharray="2,1" />
        <line x1="0" y1="28" x2="50" y2="28" stroke="rgba(234,179,8,0.2)" strokeWidth="0.15" strokeDasharray="2,1" />
        {/* Storage racks */}
        {[[2,4],[2,7],[2,10],[12,4],[12,7],[12,10],[30,4],[30,7],[30,10],[40,4],[40,7],[2,30],[2,33],[12,30],[30,30],[40,30]].map(([x,y],i) => (
          <rect key={i} x={x} y={y} width="8" height="1.6" fill="#0d0d16" stroke="rgba(56,189,248,0.12)" strokeWidth="0.12" rx="0.3" />
        ))}
        {/* Charging docks */}
        {[[5,44],[15,44],[25,44]].map(([x,y],i) => {
          const p = 1.2 + Math.sin(tick * 0.4 + i) * 0.3;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={p + 0.5} fill="rgba(168,85,247,0.1)" />
              <circle cx={x} cy={y} r="0.7" fill="#a855f7" opacity="0.8" />
            </g>
          );
        })}
        {/* AMR nodes */}
        {amrs.map((a) => {
          const c = a.status === 'Active' ? '#4ade80' : a.status === 'Charging' ? '#38bdf8' : (a.status === 'Blocked' || a.status === 'Emergency') ? '#f43f5e' : '#52525b';
          const p = 1.8 + Math.sin(tick * 0.35 + a.currentPosition.x * 0.5) * 0.25;
          return (
            <g key={a.id}>
              <circle cx={a.currentPosition.x} cy={a.currentPosition.y} r={p} fill={`${c}20`} />
              <rect x={a.currentPosition.x - 0.85} y={a.currentPosition.y - 0.85} width="1.7" height="1.7" fill="#111118" stroke={c} strokeWidth="0.22" rx="0.35" />
              <circle cx={a.currentPosition.x} cy={a.currentPosition.y} r="0.32" fill={c} />
            </g>
          );
        })}
      </svg>
      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur">
          <span className="material-symbols-outlined text-[16px]">open_in_full</span>
          Open Digital Twin
        </div>
      </div>
    </div>
  );
};

// ─── Inline API Quick Tester ───────────────────────────────
const QuickApiPanel: React.FC = () => {
  const ENDPOINTS = [
    { label: 'List AMRs', method: 'GET' as const, path: '/api/v1/amrs' },
    { label: 'Warehouse Map', method: 'GET' as const, path: '/api/v1/warehouse/map' },
    { label: 'Task Queue', method: 'GET' as const, path: '/api/v1/tasks' },
    { label: 'Conflicts', method: 'GET' as const, path: '/api/v1/coordination/conflicts' },
    { label: 'Edge AI Feed', method: 'GET' as const, path: '/api/v1/edge-ai/perceptions' },
    { label: 'Inject Hazard', method: 'POST' as const, path: '/api/v1/warehouse/obstacle', body: { x: 24, y: 14, type: 'Pallet Debris' } },
  ];
  const [sel, setSel] = useState(ENDPOINTS[0]);
  const [resp, setResp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  const run = async () => {
    setLoading(true);
    const t0 = Date.now();
    try {
      const opts: RequestInit = { method: sel.method, headers: { 'Content-Type': 'application/json' } };
      if (sel.method === 'POST' && (sel as any).body) opts.body = JSON.stringify((sel as any).body);
      const res = await fetch(sel.path, opts);
      setStatus(res.status); setMs(Date.now() - t0);
      const d = await res.json();
      const raw = JSON.stringify(d, null, 2);
      setResp(raw.length > 500 ? raw.substring(0, 500) + '\n  ...' : raw);
    } catch (e: any) {
      setStatus(0); setMs(Date.now() - t0);
      setResp(`{ "error": "${e.message}" }`);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <div className="grid grid-cols-3 gap-1.5">
        {ENDPOINTS.map(ep => (
          <button key={ep.path} onClick={() => { setSel(ep); setResp(null); setStatus(null); }}
            className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium text-left transition-all cursor-pointer ${
              sel.path === ep.path
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/[0.03] border-white/8 text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200'
            }`}>
            <span className={`block text-[8px] font-bold mb-0.5 ${ep.method === 'POST' ? 'text-sky-400' : 'text-emerald-400'}`}>{ep.method}</span>
            {ep.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 bg-black/30 border border-white/8 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-neutral-400 truncate">
          <span className="text-neutral-600">localhost:5005</span>{sel.path}
        </div>
        <button onClick={run} disabled={loading}
          className="flex-shrink-0 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1">
          {loading
            ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            : <span className="material-symbols-outlined text-[12px]">send</span>}
          Send
        </button>
      </div>
      <div className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06]">
          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-wider">Response</span>
          {status !== null && (
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-bold ${status >= 200 && status < 300 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status >= 200 && status < 300 ? '✓' : '✗'} {status}
              </span>
              <span className="text-[9px] font-mono text-neutral-600">{ms}ms</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-3">
          {resp
            ? <pre className="text-[9px] font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap break-all">{resp}</pre>
            : <p className="text-[10px] font-mono text-neutral-700 text-center mt-4">Press Send to test</p>
          }
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
export const DashboardView: React.FC<DashboardViewProps> = ({
  language, amrs, tasks, conflicts, alerts, metrics, isConnected, onNavigate, onSelectAmr
}) => {
  const isHi = language === 'hi';

  // Hero Slideshow Carousel Data
  const HERO_SLIDES = [
    {
      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
      badge: 'ZONE B — HIGH-SPEED PICK & PLACE',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      titleEn: 'NEXUS AMR OS — Autonomous Warehouse Intelligence',
      titleHi: 'NEXUS AMR OS — स्वायत्त फ्लीट इंटेलिजेंस',
      descEn: 'Next-Generation Autonomous Mobile Robot Operating System built for Bharat Electronics Limited (BEL). Integrates Sub-18ms Edge AI vision, distributed A* spatial path coordination, transparent multi-criteria task allocation scoring, and real-time telemetry streaming.',
      descHi: 'भारत इलेक्ट्रॉनिक्स लिमिटेड (BEL) के लिए निर्मित नेक्स्ट-जनरेशन एएमआर फ्लीट ऑपरेटिंग सिस्टम। इसमें सब-18ms एज AI विज़न, वितरित A* पाथ समन्वय, और पारदर्शी कार्य आवंटन स्कोरिंग शामिल है।',
      view: 'overview' as ActiveView
    },
    {
      img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80',
      badge: 'ZONE A — INBOUND RECEIVING DOCK',
      badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
      titleEn: 'Automated Goods Receiving & Conveyor Ingestion',
      titleHi: 'स्वचालित सामान प्राप्ति एवं पैलेट प्रेषण',
      descEn: 'Real-time synchronization between inbound dock conveyors and AMR nodes for rapid pallet offloading and dynamic storage placement.',
      descHi: 'इनबाउंड डॉक कन्वेयर और एएमआर फ्लीट नोड्स के बीच त्वरित पैलेट ट्रांसफर का रियल-टाइम सिंक्रनाइज़ेशन।',
      view: 'tasks' as ActiveView
    },
    {
      img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
      badge: 'BEL COMMAND HQ — LIVE TELEMETRY CORE',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      titleEn: 'BEL Central Operations & Telemetry Control Room',
      titleHi: 'बीईएल सेंट्रल ऑपरेशन्स एवं टेलीमेट्री कंट्रोल रूम',
      descEn: 'High-frequency 500ms WebSocket telemetry mesh delivering real-time battery monitoring, speed telemetry, collision avoidance warnings, and manual E-stop overrides.',
      descHi: 'हाई-फ्रीक्वेंसी 500ms वेबसॉकेट टेलीमेट्री मेश जो रियल-टाइम बैटरी मॉनिटरिंग और मैनुअल ई-स्टॉप ओवरराइड्स प्रदान करता है।',
      view: 'fleet' as ActiveView
    },
    {
      img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1600&q=80',
      badge: 'CHARGING DOCK C1 — AUTOMATED RECHARGE',
      badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      titleEn: 'Autonomous Battery Management & Wireless Docking',
      titleHi: 'स्वायत्त बैटरी प्रबंधन एवं वायरलेस चार्जिंग',
      descEn: 'Automatic low-battery threshold detection (<15%) dynamically re-routes active AMRs to inductive wireless charging pads for zero-downtime operation.',
      descHi: 'कम बैटरी थ्रेशोल्ड डिटेक्शन (<15%) जो सक्रिय एएमआर को स्वचालित रूप से चार्जिंग पैड पर पुनर्निर्देशित करता है।',
      view: 'analytics' as ActiveView
    }
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, HERO_SLIDES.length]);

  const currentSlide = HERO_SLIDES[slideIndex];

  // Derived
  const activeAmrs   = amrs.filter(a => a.status === 'Active').length;
  const chargingAmrs = amrs.filter(a => a.status === 'Charging').length;
  const blockedAmrs  = amrs.filter(a => a.status === 'Blocked' || a.status === 'Emergency').length;
  const inProgress   = tasks.filter(t => t.status === 'IN_TRANSIT' || t.status === 'ASSIGNED').length;
  const pending      = tasks.filter(t => t.status === 'PENDING').length;
  const completed    = tasks.filter(t => t.status === 'COMPLETED').length;
  const critAlerts   = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;
  const avgBattery   = amrs.length ? Math.round(amrs.reduce((s, a) => s + a.batteryLevel, 0) / amrs.length) : 0;
  const activeConflicts = conflicts.filter(c => !c.resolved).length;

  const throughput   = metrics.warehouseThroughputPalletsHr || 145;
  const compRate     = metrics.taskCompletionRatePct || 94;

  return (
    <div className="space-y-5 select-none font-sans">

      {/* ══════════════════════════════════════════════════════
          HERO BANNER — Automated Interactive Photo Slideshow
      ══════════════════════════════════════════════════════ */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 group"
        style={{ minHeight: '220px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background photo slideshow with crossfade */}
        {HERO_SLIDES.map((slide, idx) => (
          <img
            key={idx}
            src={slide.img}
            alt={slide.titleEn}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === slideIndex ? 'opacity-100 scale-105 transition-transform duration-10000 ease-out' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))}

        {/* Dark gradient scrim — Apple-style dark overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.65) 50%, rgba(10,20,40,0.85) 100%)'
        }} />
        {/* Subtle colour tint */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(74,222,128,0.08) 0%, transparent 50%)'
        }} />

        {/* Slideshow Content */}
        <div className="relative px-8 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            {/* Eyebrow Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                isConnected
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {isConnected ? 'All Systems Live' : 'Disconnected'}
              </span>
              <span className="text-[11px] font-mono text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">SIH26123</span>
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border backdrop-blur-sm ${currentSlide.badgeColor}`}>
                {currentSlide.badge}
              </span>
            </div>

            {/* Slide Title & Introduction Description */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
              {isHi ? currentSlide.titleHi : currentSlide.titleEn}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-xl">
              {isHi ? currentSlide.descHi : currentSlide.descEn}
            </p>

            {/* Quick Action Button for current slide */}
            <div className="pt-1">
              <button
                onClick={() => onNavigate(currentSlide.view)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 backdrop-blur-md shadow-lg"
              >
                <span>Explore View</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Right: Live clock + quick stats */}
          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'system-ui', letterSpacing: '-0.03em' }}>
                <LiveClock />
              </div>
              <div className="text-[11px] text-white/40 mt-0.5">Indian Standard Time</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white/8 backdrop-blur border border-white/10 rounded-2xl px-4 py-2.5 text-center">
                <div className="text-xl font-bold text-emerald-400 font-mono" style={{ letterSpacing: '-0.02em' }}>{activeAmrs}</div>
                <div className="text-[10px] text-white/40 mt-0.5">Active AMRs</div>
              </div>
              <div className="bg-white/8 backdrop-blur border border-white/10 rounded-2xl px-4 py-2.5 text-center">
                <div className="text-xl font-bold text-sky-400 font-mono" style={{ letterSpacing: '-0.02em' }}>{throughput}</div>
                <div className="text-[10px] text-white/40 mt-0.5">Pallets/hr</div>
              </div>
              <div className="bg-white/8 backdrop-blur border border-white/10 rounded-2xl px-4 py-2.5 text-center">
                <div className={`text-xl font-bold font-mono ${critAlerts > 0 ? 'text-rose-400' : 'text-emerald-400'}`} style={{ letterSpacing: '-0.02em' }}>{critAlerts}</div>
                <div className="text-[10px] text-white/40 mt-0.5">Alerts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls Bar (Dots & Prev/Next Buttons) */}
        <div className="absolute bottom-3 left-8 right-8 flex items-center justify-between pointer-events-auto">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === slideIndex ? 'w-6 bg-sky-400' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls: Prev / Pause / Next */}
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
            <button
              onClick={() => setSlideIndex((slideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Previous slide"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            >
              <span className="material-symbols-outlined text-[14px]">{isPaused ? 'play_arrow' : 'pause'}</span>
            </button>
            <button
              onClick={() => setSlideIndex((slideIndex + 1) % HERO_SLIDES.length)}
              className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Next slide"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          KPI METRIC CARDS — Apple bento grid style
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          {
            label: 'Active AMRs', value: activeAmrs, sub: `of ${amrs.length} fleet`,
            icon: 'smart_toy', color: '#4ade80', gradFrom: 'from-emerald-500/20', gradTo: 'to-emerald-500/0',
            border: 'border-emerald-500/20', spark: [2,3,5,4,6,5,activeAmrs],
            view: 'fleet' as ActiveView, detail: `${chargingAmrs} charging`
          },
          {
            label: 'Throughput', value: throughput, sub: 'pallets / hr',
            icon: 'local_shipping', color: '#38bdf8', gradFrom: 'from-sky-500/20', gradTo: 'to-sky-500/0',
            border: 'border-sky-500/20', spark: [108,132,148,142,156,161,throughput],
            view: 'analytics' as ActiveView, detail: `${compRate}% task rate`
          },
          {
            label: 'In Progress', value: inProgress, sub: 'tasks running',
            icon: 'assignment', color: '#a78bfa', gradFrom: 'from-violet-500/20', gradTo: 'to-violet-500/0',
            border: 'border-violet-500/20', spark: [5,8,12,10,15,inProgress,inProgress],
            view: 'tasks' as ActiveView, detail: `${pending} pending`
          },
          {
            label: 'Avg Battery', value: `${avgBattery}%`, sub: 'fleet average',
            icon: 'battery_4_bar', color: avgBattery > 50 ? '#4ade80' : '#f59e0b',
            gradFrom: avgBattery > 50 ? 'from-emerald-500/20' : 'from-amber-500/20',
            gradTo: avgBattery > 50 ? 'to-emerald-500/0' : 'to-amber-500/0',
            border: avgBattery > 50 ? 'border-emerald-500/20' : 'border-amber-500/20',
            spark: [82,79,74,71,68,72,avgBattery],
            view: 'fleet' as ActiveView, detail: `${amrs.filter(a=>a.batteryLevel < 20).length} critical`
          },
          {
            label: 'Conflicts', value: activeConflicts, sub: 'route conflicts',
            icon: 'alt_route', color: activeConflicts > 0 ? '#f43f5e' : '#4ade80',
            gradFrom: activeConflicts > 0 ? 'from-rose-500/20' : 'from-emerald-500/20',
            gradTo: 'to-transparent',
            border: activeConflicts > 0 ? 'border-rose-500/20' : 'border-emerald-500/20',
            spark: [2,1,3,2,1,0,activeConflicts],
            view: 'coordination' as ActiveView, detail: 'A* STA active'
          },
          {
            label: 'Completed', value: completed, sub: 'tasks today',
            icon: 'task_alt', color: '#34d399', gradFrom: 'from-teal-500/20', gradTo: 'to-teal-500/0',
            border: 'border-teal-500/20', spark: [14,18,22,19,25,28,completed],
            view: 'tasks' as ActiveView, detail: `${compRate}% success`
          },
        ].map((k, i) => (
          <button key={i} onClick={() => onNavigate(k.view)}
            className={`group relative bg-gradient-to-b ${k.gradFrom} ${k.gradTo} bg-[#0f0f14] border ${k.border} rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.97] overflow-hidden`}>
            {/* Subtle glow behind icon */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: k.color }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${k.color}20`, border: `1px solid ${k.color}30` }}>
                  <span className="material-symbols-outlined text-[16px]" style={{ color: k.color }}>{k.icon}</span>
                </div>
                <span className="material-symbols-outlined text-[13px] text-neutral-700 group-hover:text-neutral-500 transition-colors">north_east</span>
              </div>
              <div className="text-2xl font-bold font-mono mb-0.5" style={{ color: k.color, letterSpacing: '-0.03em' }}>{k.value}</div>
              <div className="text-[10px] text-neutral-400 mb-2">{k.label}</div>
              <Sparkline values={k.spark} color={k.color} height={28} />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[9px] text-neutral-600 font-mono">{k.sub}</span>
                <span className="text-[9px] text-neutral-600">{k.detail}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN BENTO GRID
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

        {/* ── Live Digital Twin Map ─────────────────── */}
        <div className="xl:col-span-5 bg-[#07070c] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ minHeight: '420px' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>Digital Twin — Live</span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded-lg">50×50 GRID</span>
            </div>
            <button onClick={() => onNavigate('overview')}
              className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer">
              Full View
              <span className="material-symbols-outlined text-[14px]">north_east</span>
            </button>
          </div>
          <div className="flex-1 p-3">
            <MiniMap amrs={amrs} onClick={() => onNavigate('overview')} />
          </div>
          {/* Fleet Summary Strip */}
          <div className="px-5 py-3 border-t border-neutral-800/60 grid grid-cols-4 gap-2">
            {[
              { label: 'Active', val: activeAmrs, color: '#4ade80' },
              { label: 'Charging', val: chargingAmrs, color: '#38bdf8' },
              { label: 'Blocked', val: blockedAmrs, color: '#f43f5e' },
              { label: 'Hazards', val: 0, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-base font-bold font-mono" style={{ color: s.color }}>{s.val}</div>
                <div className="text-[9px] text-neutral-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fleet Cards ───────────────────────────── */}
        <div className="xl:col-span-3 flex flex-col bg-[#0f0f14] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-sky-400">smart_toy</span>
              <span className="text-sm font-semibold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>AMR Fleet</span>
            </div>
            <button onClick={() => onNavigate('fleet')} className="text-[11px] font-medium text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5">
              Manage <span className="material-symbols-outlined text-[13px]">north_east</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40" style={{ scrollbarWidth: 'none' }}>
            {amrs.map((amr) => {
              const isA = amr.status === 'Active', isC = amr.status === 'Charging';
              const isB = amr.status === 'Blocked' || amr.status === 'Emergency';
              const c = isA ? '#4ade80' : isC ? '#38bdf8' : isB ? '#f43f5e' : '#52525b';
              return (
                <button key={amr.id} onClick={() => onSelectAmr(amr.id)}
                  className="w-full px-5 py-3 hover:bg-white/[0.03] text-left transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}80` }} />
                      <span className="text-sm font-semibold text-white font-mono">{amr.code}</span>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md" style={{ color: c, backgroundColor: `${c}15`, border: `1px solid ${c}25` }}>{amr.status}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">{amr.speed.toFixed(2)} m/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${amr.batteryLevel}%`, backgroundColor: amr.batteryLevel > 40 ? '#4ade80' : '#f43f5e' }} />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500 w-7 text-right">{amr.batteryLevel}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Alerts + API ─────────────── */}
        <div className="xl:col-span-4 flex flex-col gap-4">

          {/* Recent Alerts */}
          <div className="bg-[#0f0f14] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-rose-400">notifications_active</span>
                <span className="text-sm font-semibold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>Alerts</span>
                {critAlerts > 0 && (
                  <span className="text-[9px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/25 px-1.5 py-0.5 rounded-full animate-pulse">{critAlerts} CRITICAL</span>
                )}
              </div>
              <button onClick={() => onNavigate('alerts')} className="text-[11px] font-medium text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5">
                All <span className="material-symbols-outlined text-[13px]">north_east</span>
              </button>
            </div>
            <div className="divide-y divide-neutral-800/40 max-h-[190px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {alerts.slice(0, 5).map((a) => (
                <div key={a.id} className="px-5 py-2.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                  <span className={`material-symbols-outlined text-[14px] mt-0.5 flex-shrink-0 ${a.severity === 'CRITICAL' ? 'text-rose-400' : a.severity === 'WARNING' ? 'text-amber-400' : 'text-sky-400'}`}>
                    {a.severity === 'CRITICAL' ? 'error' : a.severity === 'WARNING' ? 'warning' : 'info'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-neutral-300 leading-snug truncate">{a.message}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {a.amrCode && <span className="text-[9px] font-mono text-neutral-600">{a.amrCode}</span>}
                      <span className={`text-[9px] font-mono ${a.resolved ? 'text-emerald-600' : 'text-rose-500'}`}>{a.resolved ? '✓ resolved' : '● active'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="px-5 py-5 text-center">
                  <span className="material-symbols-outlined text-2xl text-emerald-500/50 block mb-1">check_circle</span>
                  <p className="text-[11px] text-neutral-600">No active alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Integrated API Quick Test */}
          <div className="flex-1 bg-[#0c0c12] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl flex flex-col" style={{ minHeight: '260px' }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-violet-400">api</span>
                <span className="text-sm font-semibold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>API Quick Test</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> :5005
                </span>
              </div>
              <span className="text-[9px] font-mono text-neutral-600">REST · JSON</span>
            </div>
            <div className="p-4 flex-1 flex flex-col min-h-0">
              <QuickApiPanel />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PHOTO ROW — Warehouse context with Apple-style cards
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
            title: 'Zone B — Rack Operations', subtitle: 'AMR-02 & AMR-04 active',
            badge: 'OVERHEAD CAM 01', badgeColor: '#4ade80',
            stat: `${activeAmrs} moving`, view: 'overview' as ActiveView
          },
          {
            img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=800&q=80',
            title: 'Edge AI Perception Feed', subtitle: 'YOLOv8 INT8 · 12.5ms inference',
            badge: 'LIVE CCTV', badgeColor: '#38bdf8',
            stat: '<15ms latency', view: 'edge-ai' as ActiveView
          },
          {
            img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
            title: 'SIH Judge Demo Scenarios', subtitle: '4 scenarios ready for evaluation',
            badge: 'JUDGE MODE', badgeColor: '#f59e0b',
            stat: 'Demo ready', view: 'simulation' as ActiveView
          },
        ].map((item, i) => (
          <button key={i} onClick={() => onNavigate(item.view)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer text-left shadow-2xl"
            style={{ minHeight: '180px' }}>
            <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {/* Gradient */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Badge top */}
            <div className="absolute top-3.5 left-3.5">
              <span className="text-[9px] font-mono font-bold px-2 py-1 rounded-full backdrop-blur-sm border"
                style={{ color: item.badgeColor, backgroundColor: `${item.badgeColor}20`, borderColor: `${item.badgeColor}40` }}>
                ● {item.badge}
              </span>
            </div>
            {/* Arrow top-right */}
            <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]">north_east</span>
              </div>
            </div>
            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-sm font-semibold text-white mb-0.5" style={{ letterSpacing: '-0.01em' }}>{item.title}</div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">{item.subtitle}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: item.badgeColor }}>{item.stat}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          BOTTOM ROW — Task pipeline + System health
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Task Pipeline */}
        <div className="bg-[#0f0f14] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-violet-400">assignment</span>
              <span className="text-sm font-semibold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>Task Pipeline</span>
              <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">{inProgress} running</span>
            </div>
            <button onClick={() => onNavigate('tasks')} className="text-[11px] font-medium text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5">
              Manage <span className="material-symbols-outlined text-[13px]">north_east</span>
            </button>
          </div>
          <div className="divide-y divide-neutral-800/40 max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {tasks.slice(0, 9).map((task) => {
              const sColor = task.status === 'COMPLETED' ? '#4ade80' : task.status === 'IN_TRANSIT' || task.status === 'ASSIGNED' ? '#38bdf8' : task.status === 'FAILED' ? '#f43f5e' : '#52525b';
              const pColor = task.priority === 'CRITICAL' ? '#f43f5e' : task.priority === 'HIGH' ? '#f59e0b' : '#71717a';
              return (
                <div key={task.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: pColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-neutral-200">{task.taskCode}</span>
                      {task.assignedAmrCode && <span className="text-[9px] font-mono text-sky-400">{task.assignedAmrCode}</span>}
                    </div>
                    <p className="text-[9px] text-neutral-600 truncate mt-0.5">{task.pickupStationName} → {task.dropoffStationName}</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold flex-shrink-0" style={{ color: sColor }}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#0f0f14] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">monitor_heart</span>
              <span className="text-sm font-semibold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>System Health</span>
            </div>
            <button onClick={() => onNavigate('analytics')} className="text-[11px] font-medium text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5">
              Analytics <span className="material-symbols-outlined text-[13px]">north_east</span>
            </button>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Task Completion', val: `${compRate}%`, pct: compRate, color: '#4ade80', icon: 'task_alt' },
              { label: 'Fleet Uptime', val: '97.4%', pct: 97, color: '#38bdf8', icon: 'electrical_services' },
              { label: 'Avg Task Time', val: `${metrics.avgTaskTimeSec || 42}s`, pct: 70, color: '#a78bfa', icon: 'timer' },
              { label: 'Collisions Avoided', val: `${metrics.collisionWarningsAvoidedCount || 124}`, pct: 100, color: '#4ade80', icon: 'verified_user' },
              { label: 'WiFi Latency', val: `${metrics.avgWifiLatencyMs || 14}ms`, pct: 90, color: '#38bdf8', icon: 'wifi' },
              { label: 'Edge AI mAP@50', val: '94.2%', pct: 94, color: '#f59e0b', icon: 'psychology' },
            ].map(({ label, val, pct, color, icon }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[13px]" style={{ color }}>{icon}</span>
                  <span className="text-[10px] text-neutral-500">{label}</span>
                </div>
                <div className="text-base font-bold font-mono mb-2" style={{ color, letterSpacing: '-0.02em' }}>{val}</div>
                <div className="w-full bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
          {/* Throughput chart */}
          <div className="px-5 pb-5">
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-neutral-500">12-Hour Throughput (pallets/hr)</span>
                <span className="text-[10px] font-mono font-bold text-sky-400">{throughput} ph</span>
              </div>
              <Sparkline values={[108,132,148,142,156,161,158,throughput]} color="#38bdf8" height={40} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          QUICK NAV SHORTCUTS — Apple app icon grid
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Digital Twin', desc: 'Live 2.5D warehouse map', icon: 'grid_view', view: 'overview' as ActiveView, color: '#38bdf8', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=70' },
          { label: 'Edge AI Vision', desc: '4-camera CCTV & YOLOv8', icon: 'videocam_sensor', view: 'edge-ai' as ActiveView, color: '#4ade80', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=70' },
          { label: 'Judge Demo', desc: 'SIH evaluation scenarios', icon: 'sports_esports', view: 'simulation' as ActiveView, color: '#f59e0b', img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=70' },
          { label: 'Multi-Robot', desc: 'A* conflict resolution', icon: 'alt_route', view: 'coordination' as ActiveView, color: '#a78bfa', img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=400&q=70' },
        ].map(({ label, desc, icon, view, color, img }) => (
          <button key={view} onClick={() => onNavigate(view)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer text-left shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
            style={{ minHeight: '100px' }}>
            <img src={img} alt={label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 100%)` }} />
            <div className="relative p-4 flex items-center gap-3 h-full">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm" style={{ backgroundColor: `${color}25`, border: `1px solid ${color}40` }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>{label}</div>
                <div className="text-[10px] text-white/40">{desc}</div>
              </div>
              <span className="material-symbols-outlined text-neutral-600 group-hover:text-neutral-300 text-[16px] transition-colors">north_east</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
