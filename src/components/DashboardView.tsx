import React, { useState, useEffect, useRef } from 'react';
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

// ─── Live Clock ────────────────────────────────────────────────────────────────
const LiveClock: React.FC = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const iv = setInterval(() => setT(new Date()), 1000); return () => clearInterval(iv); }, []);
  return (
    <span className="font-mono tabular-nums tracking-tight">
      <span className="text-white">{String(t.getHours()).padStart(2,'0')}:{String(t.getMinutes()).padStart(2,'0')}</span>
      <span className="text-neutral-600">:{String(t.getSeconds()).padStart(2,'0')}</span>
    </span>
  );
};

// ─── Sparkline ─────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ values: number[]; color: string; height?: number }> = ({ values, color, height = 36 }) => {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1); const min = Math.min(...values);
  const range = max - min || 1;
  const W = 120; const H = height;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * (H - 6) - 3}`).join(' ');
  const uid = color.replace(/[^a-z0-9]/gi, '') + height;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#sg-${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {(() => { const v = values[values.length-1]; const x = W; const y = H - ((v-min)/range)*(H-6)-3; return <circle cx={x} cy={y} r="2.5" fill={color} />; })()}
    </svg>
  );
};

// ─── Ring Gauge ────────────────────────────────────────────────────────────────
const RingGauge: React.FC<{ pct: number; color: string; size?: number; strokeW?: number }> = ({ pct, color, size = 56, strokeW = 5 }) => {
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
};

// ─── Live Activity Feed ────────────────────────────────────────────────────────
interface FeedEntry { id: string; icon: string; color: string; msg: string; time: string; tag: string; }
const LiveActivityFeed: React.FC<{ alerts: OperationalAlert[]; tasks: WarehouseTask[]; amrs: AMR[] }> = ({ alerts, tasks, amrs }) => {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const prevRef = useRef({ alerts: alerts.length, tasks: tasks.length });

  useEffect(() => {
    const entries: FeedEntry[] = [];
    alerts.slice(0, 4).forEach(a => entries.push({
      id: a.id, icon: a.severity === 'CRITICAL' ? 'error' : a.severity === 'WARNING' ? 'warning' : 'info',
      color: a.severity === 'CRITICAL' ? '#f43f5e' : a.severity === 'WARNING' ? '#f59e0b' : '#38bdf8',
      msg: a.message, time: new Date(a.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tag: a.amrCode || a.severity
    }));
    tasks.filter(t => t.status === 'COMPLETED').slice(0, 3).forEach(t => entries.push({
      id: t.id, icon: 'task_alt', color: '#4ade80',
      msg: `Task ${t.taskCode} completed — ${t.pickupStationName} to ${t.dropoffStationName}`,
      time: t.completedTime ? new Date(t.completedTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--',
      tag: t.assignedAmrCode || 'TASK'
    }));
    amrs.filter(a => a.status === 'Charging').slice(0, 2).forEach(a => entries.push({
      id: a.id + '-chg', icon: 'battery_charging_full', color: '#a78bfa',
      msg: `${a.code} docked for charging at ${a.batteryLevel}%`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tag: 'BATTERY'
    }));
    setFeed(entries.slice(0, 8));
    prevRef.current = { alerts: alerts.length, tasks: tasks.length };
  }, [alerts, tasks, amrs]);

  return (
    <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: '320px' }}>
      {feed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-neutral-700">
          <span className="material-symbols-outlined text-3xl">sensors</span>
          <span className="text-xs font-mono">Awaiting telemetry...</span>
        </div>
      )}
      {feed.map((f, i) => (
        <div key={f.id + i} className="flex items-start gap-3 px-5 py-3 border-b border-neutral-800/40 hover:bg-white/[0.02] transition-colors">
          <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}25` }}>
            <span className="material-symbols-outlined text-[13px]" style={{ color: f.color }}>{f.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-neutral-300 leading-snug">{f.msg}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-mono text-neutral-600">{f.time}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
                style={{ color: f.color, backgroundColor: `${f.color}12`, border: `1px solid ${f.color}20` }}>
                {f.tag}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Mini Digital Twin Map ─────────────────────────────────────────────────────
const MiniMap: React.FC<{ amrs: AMR[]; onClick: () => void }> = ({ amrs, onClick }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 180); return () => clearInterval(iv); }, []);
  return (
    <div className="relative w-full h-full cursor-pointer group" onClick={onClick}>
      <svg viewBox="0 0 50 50" className="w-full h-full"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, #070d1a 0%, #04040a 100%)' }}>
        <defs>
          <pattern id="mmpg2" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(56,189,248,0.07)" strokeWidth="0.18" />
          </pattern>
        </defs>
        <rect width="50" height="50" fill="url(#mmpg2)" />
        <rect x="0" y="22" width="50" height="6" fill="rgba(56,189,248,0.025)" />
        <line x1="0" y1="22" x2="50" y2="22" stroke="rgba(234,179,8,0.25)" strokeWidth="0.12" strokeDasharray="2,1.2" />
        <line x1="0" y1="28" x2="50" y2="28" stroke="rgba(234,179,8,0.25)" strokeWidth="0.12" strokeDasharray="2,1.2" />
        {[[2,4],[2,7],[2,10],[12,4],[12,7],[12,10],[30,4],[30,7],[30,10],[40,4],[40,7],[2,30],[2,33],[12,30],[30,30],[40,30]].map(([x,y],i) => (
          <rect key={i} x={x} y={y} width="8" height="1.6" fill="#080810" stroke="rgba(56,189,248,0.14)" strokeWidth="0.1" rx="0.3" />
        ))}
        {[[5,44],[15,44],[25,44]].map(([x,y],i) => {
          const p = 1.2 + Math.sin(tick * 0.4 + i) * 0.35;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={p + 0.5} fill="rgba(168,85,247,0.08)" />
              <circle cx={x} cy={y} r="0.65" fill="#a855f7" opacity="0.9" />
            </g>
          );
        })}
        {amrs.filter(a => a.currentRoute.length > 1).map(a => {
          const pts = a.currentRoute.slice(0, 4).map(p => `${p.x},${p.y}`).join(' ');
          const c = a.status === 'Active' ? '#4ade80' : '#52525b';
          return <polyline key={a.id+'-r'} points={pts} fill="none" stroke={c} strokeWidth="0.1" strokeOpacity="0.3" strokeDasharray="0.5,0.5" />;
        })}
        {amrs.map((a) => {
          const c = a.status === 'Active' ? '#4ade80' : a.status === 'Charging' ? '#38bdf8' : (a.status === 'Blocked' || a.status === 'Emergency') ? '#f43f5e' : '#52525b';
          const p = 2.2 + Math.sin(tick * 0.3 + a.currentPosition.x * 0.4) * 0.3;
          return (
            <g key={a.id}>
              {a.status === 'Active' && <circle cx={a.currentPosition.x} cy={a.currentPosition.y} r={p} fill={`${c}18`} />}
              <rect x={a.currentPosition.x - 0.9} y={a.currentPosition.y - 0.9} width="1.8" height="1.8"
                fill="#0a0a12" stroke={c} strokeWidth="0.25" rx="0.4" />
              <circle cx={a.currentPosition.x} cy={a.currentPosition.y} r="0.3" fill={c} />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/50 backdrop-blur-[2px] rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-[15px]">open_in_full</span>
          Open Digital Twin
        </div>
      </div>
    </div>
  );
};

// ─── Quick API Panel ───────────────────────────────────────────────────────────
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
    setLoading(true); const t0 = Date.now();
    try {
      const opts: RequestInit = { method: sel.method, headers: { 'Content-Type': 'application/json' } };
      if (sel.method === 'POST' && (sel as any).body) opts.body = JSON.stringify((sel as any).body);
      const res = await fetch(sel.path, opts); setStatus(res.status); setMs(Date.now() - t0);
      const d = await res.json(); const raw = JSON.stringify(d, null, 2);
      setResp(raw.length > 500 ? raw.substring(0, 500) + '\n  ...' : raw);
    } catch (e: any) { setStatus(0); setMs(Date.now() - t0); setResp(`{ "error": "${e.message}" }`); }
    finally { setLoading(false); }
  };
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="grid grid-cols-3 gap-1">
        {ENDPOINTS.map(ep => (
          <button key={ep.path} onClick={() => { setSel(ep); setResp(null); setStatus(null); }}
            className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium text-left transition-all cursor-pointer ${
              sel.path === ep.path ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.06] text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-200'
            }`}>
            <span className={`block text-[8px] font-bold mb-0.5 ${ep.method === 'POST' ? 'text-sky-400' : 'text-emerald-400'}`}>{ep.method}</span>
            {ep.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 items-center">
        <div className="flex-1 bg-black/40 border border-white/[0.07] rounded-lg px-2 py-1 text-[10px] font-mono text-neutral-500 truncate">
          <span className="text-neutral-700">localhost:5005</span>{sel.path}
        </div>
        <button onClick={run} disabled={loading}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1">
          {loading ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            : <span className="material-symbols-outlined text-[12px]">send</span>}
          Run
        </button>
      </div>
      <div className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl flex flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05]">
          <span className="text-[9px] font-mono text-neutral-700 uppercase tracking-wider">Response</span>
          {status !== null && (
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-bold ${status >= 200 && status < 300 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status >= 200 && status < 300 ? '✓' : '✗'} {status}
              </span>
              <span className="text-[9px] font-mono text-neutral-600">{ms}ms</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-2.5">
          {resp ? <pre className="text-[9px] font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap break-all">{resp}</pre>
            : <p className="text-[10px] font-mono text-neutral-700 text-center mt-4">Press Run to test endpoint</p>}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardView: React.FC<DashboardViewProps> = ({
  language, amrs, tasks, conflicts, alerts, metrics, isConnected, onNavigate, onSelectAmr
}) => {
  const isHi = language === 'hi';

  const HERO_SLIDES = [
    {
      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
      badge: 'ZONE B — HIGH-SPEED PICK & PLACE', badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      titleEn: 'NEXUS AMR OS', titleHi: 'NEXUS AMR OS',
      subtitleEn: 'Autonomous Warehouse Intelligence Platform', subtitleHi: 'स्वायत्त वेयरहाउस इंटेलिजेंस प्लेटफॉर्म',
      descEn: 'Next-Generation AMR Fleet OS for Bharat Electronics Limited — Sub-18ms Edge AI vision, distributed A* path coordination, and real-time 500ms telemetry mesh.',
      descHi: 'BEL के लिए नेक्स्ट-जेन AMR फ्लीट OS — सब-18ms एज AI, A* पाथ समन्वय, 500ms टेलीमेट्री।',
      view: 'overview' as ActiveView, accentColor: '#4ade80',
    },
    {
      img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80',
      badge: 'ZONE A — INBOUND RECEIVING DOCK', badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
      titleEn: 'Automated Goods Receiving', titleHi: 'स्वचालित सामान प्राप्ति',
      subtitleEn: 'Real-time conveyor & AMR synchronization', subtitleHi: 'कन्वेयर और एएमआर रियल-टाइम सिंक',
      descEn: 'Real-time synchronization between inbound dock conveyors and AMR nodes for rapid pallet offloading and dynamic storage placement.',
      descHi: 'इनबाउंड डॉक और एएमआर नोड्स के बीच त्वरित पैलेट ट्रांसफर का रियल-टाइम सिंक।',
      view: 'tasks' as ActiveView, accentColor: '#38bdf8',
    },
    {
      img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
      badge: 'BEL COMMAND HQ — LIVE TELEMETRY', badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      titleEn: 'BEL Control Room', titleHi: 'बीईएल कंट्रोल रूम',
      subtitleEn: 'Centralized fleet telemetry & emergency override', subtitleHi: 'केंद्रीकृत टेलीमेट्री और इमरजेंसी ओवरराइड',
      descEn: '500ms WebSocket telemetry mesh with real-time battery monitoring, collision avoidance warnings, and manual E-stop overrides.',
      descHi: '500ms वेबसॉकेट — बैटरी मॉनिटरिंग और मैनुअल ई-स्टॉप ओवरराइड।',
      view: 'fleet' as ActiveView, accentColor: '#f59e0b',
    },
    {
      img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1600&q=80',
      badge: 'CHARGING DOCK C1 — AUTO RECHARGE', badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      titleEn: 'Autonomous Battery Management', titleHi: 'स्वायत्त बैटरी प्रबंधन',
      subtitleEn: 'Zero-downtime wireless inductive charging', subtitleHi: 'ज़ीरो-डाउनटाइम वायरलेस चार्जिंग',
      descEn: 'Automatic low-battery threshold detection (<15%) dynamically re-routes active AMRs to inductive wireless charging pads.',
      descHi: 'कम बैटरी (<15%) — सक्रिय एएमआर को चार्जिंग पैड पर स्वचालित पुनर्निर्देशण।',
      view: 'analytics' as ActiveView, accentColor: '#a78bfa',
    },
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => setSlideIndex(p => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [isPaused, HERO_SLIDES.length]);
  const S = HERO_SLIDES[slideIndex];

  const activeAmrs    = amrs.filter(a => a.status === 'Active').length;
  const chargingAmrs  = amrs.filter(a => a.status === 'Charging').length;
  const blockedAmrs   = amrs.filter(a => a.status === 'Blocked' || a.status === 'Emergency').length;
  const idleAmrs      = amrs.filter(a => a.status === 'Idle').length;
  const inProgress    = tasks.filter(t => t.status === 'IN_TRANSIT' || t.status === 'ASSIGNED').length;
  const pending       = tasks.filter(t => t.status === 'PENDING').length;
  const completed     = tasks.filter(t => t.status === 'COMPLETED').length;
  const critAlerts    = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;
  const avgBattery    = amrs.length ? Math.round(amrs.reduce((s, a) => s + a.batteryLevel, 0) / amrs.length) : 0;
  const activeConflicts = conflicts.filter(c => !c.resolved).length;
  const throughput    = metrics.warehouseThroughputPalletsHr || 145;
  const compRate      = metrics.taskCompletionRatePct || 94;
  const lowBattery    = amrs.filter(a => a.batteryLevel < 20).length;

  return (
    <div className="space-y-5 select-none font-sans">

      {/* ══════════════ HERO BANNER ══════════════ */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ minHeight: '300px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}>

        {HERO_SLIDES.map((slide, idx) => (
          <img key={idx} src={slide.img} alt={slide.titleEn}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === slideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
        ))}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.60) 55%, rgba(0,0,0,0.80) 100%)' }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 15% 60%, ${S.accentColor}18 0%, transparent 55%)` }} />

        <div className="relative px-8 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 h-full" style={{ minHeight: '300px' }}>
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${isConnected ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {isConnected ? 'All Systems Live' : 'Disconnected'}
              </span>
              <span className="text-[11px] font-mono text-white/35 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">SIH26123</span>
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${S.badgeColor}`}>{S.badge}</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none"
                style={{ letterSpacing: '-0.03em', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
                {isHi ? S.titleHi : S.titleEn}
              </h1>
              <p className="mt-1 text-base font-semibold" style={{ color: S.accentColor, letterSpacing: '-0.01em' }}>
                {isHi ? S.subtitleHi : S.subtitleEn}
              </p>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-lg">{isHi ? S.descHi : S.descEn}</p>
            <div className="flex items-center gap-3 pt-1">
              <button onClick={() => onNavigate(S.view)}
                className="px-5 py-2.5 text-sm font-bold text-black rounded-2xl transition-all hover:opacity-90 cursor-pointer shadow-lg"
                style={{ backgroundColor: S.accentColor }}>
                {isHi ? 'एक्सप्लोर करें' : 'Explore View'}
              </button>
              <button onClick={() => onNavigate('fleet')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl transition-all cursor-pointer backdrop-blur-md">
                {isHi ? 'फ्लीट' : 'Fleet'}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <div className="text-4xl font-bold" style={{ letterSpacing: '-0.04em' }}><LiveClock /></div>
              <div className="text-[11px] text-white/35 mt-0.5 font-mono">Indian Standard Time</div>
            </div>
            <div className="flex gap-2">
              {[
                { val: activeAmrs, label: 'Active AMRs', color: '#4ade80' },
                { val: throughput, label: 'Pallets/hr', color: '#38bdf8' },
                { val: critAlerts, label: critAlerts > 0 ? 'Alerts!' : 'Alerts', color: critAlerts > 0 ? '#f43f5e' : '#4ade80' },
              ].map(s => (
                <div key={s.label} className="bg-black/40 backdrop-blur border border-white/10 rounded-2xl px-4 py-2.5 text-center">
                  <div className="text-xl font-black font-mono" style={{ color: s.color, letterSpacing: '-0.03em' }}>{s.val}</div>
                  <div className="text-[9px] text-white/35 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setSlideIndex(idx)}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${idx === slideIndex ? 'w-8' : 'w-2 bg-white/25 hover:bg-white/50'}`}
                style={idx === slideIndex ? { backgroundColor: S.accentColor } : {}} />
            ))}
          </div>
          <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-full px-2 py-1 backdrop-blur">
            <button onClick={() => setSlideIndex((slideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="p-1 text-white/60 hover:text-white transition-colors cursor-pointer"><span className="material-symbols-outlined text-[15px]">chevron_left</span></button>
            <button onClick={() => setIsPaused(!isPaused)} className="p-1 text-white/60 hover:text-white transition-colors cursor-pointer"><span className="material-symbols-outlined text-[13px]">{isPaused ? 'play_arrow' : 'pause'}</span></button>
            <button onClick={() => setSlideIndex((slideIndex + 1) % HERO_SLIDES.length)} className="p-1 text-white/60 hover:text-white transition-colors cursor-pointer"><span className="material-symbols-outlined text-[15px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* ══════════════ PROJECT INFO BAND ══════════════ */}
      <div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0f] overflow-hidden px-6 py-5">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 5% 50%, rgba(56,189,248,0.06) 0%, transparent 50%), radial-gradient(ellipse at 95% 50%, rgba(74,222,128,0.05) 0%, transparent 50%)' }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">Smart India Hackathon · SIH26123</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-500 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">Bharat Electronics Limited</span>
            </div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight" style={{ letterSpacing: '-0.025em' }}>
              NEXUS AMR OS — <span className="text-neutral-400 dark:text-neutral-500 font-semibold">{isHi ? 'स्वायत्त वेयरहाउस इंटेलिजेंस' : 'Autonomous Warehouse Intelligence'}</span>
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mt-1 max-w-2xl">
              {isHi
                ? 'BEL के लिए नेक्स्ट-जेन AMR फ्लीट ऑपरेटिंग सिस्टम — Sub-18ms एज AI, A* पाथ प्लानिंग, और लाइव 500ms WebSocket टेलीमेट्री।'
                : 'Next-gen AMR Fleet OS engineered for BEL — Sub-18ms Edge AI detection, distributed A* spatial path coordination, multi-criteria task scoring, and live 500ms WebSocket telemetry mesh.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { icon: 'precision_manufacturing', label: 'A* Path Planning', color: '#38bdf8' },
                { icon: 'videocam_sensor', label: 'Edge AI <18ms', color: '#4ade80' },
                { icon: 'bolt', label: 'Smart Charging', color: '#a78bfa' },
                { icon: 'sensors', label: '500ms Telemetry', color: '#f59e0b' },
                { icon: 'assignment_turned_in', label: 'Multi-Criteria Scoring', color: '#34d399' },
              ].map(({ icon, label, color }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 px-2.5 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-[13px]" style={{ color }}>{icon}</span>{label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex lg:flex-col gap-2.5 shrink-0">
            {[
              { val: amrs.length, label: isHi ? 'कुल AMR' : 'Total AMRs', color: '#38bdf8', icon: 'smart_toy' },
              { val: activeAmrs, label: isHi ? 'सक्रिय' : 'Active', color: '#4ade80', icon: 'check_circle' },
              { val: completed, label: isHi ? 'पूर्ण कार्य' : 'Tasks Done', color: '#a78bfa', icon: 'task_alt' },
            ].map(({ val, label, color, icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70 min-w-[148px]">
                <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
                <div>
                  <div className="text-xl font-black font-mono leading-none" style={{ color, letterSpacing: '-0.04em' }}>{val}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ KPI CARDS — ring gauges + sparklines ══════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Active AMRs', value: activeAmrs, sub: `of ${amrs.length} fleet`, icon: 'smart_toy', color: '#4ade80', pct: amrs.length ? (activeAmrs/amrs.length)*100 : 0, spark: [2,3,5,4,6,5,activeAmrs], view: 'fleet' as ActiveView, detail: `${chargingAmrs} charging` },
          { label: 'Throughput', value: throughput, sub: 'pallets / hr', icon: 'local_shipping', color: '#38bdf8', pct: Math.min((throughput/200)*100, 100), spark: [108,132,148,142,156,161,throughput], view: 'analytics' as ActiveView, detail: `${compRate}% rate` },
          { label: 'In Progress', value: inProgress, sub: 'tasks active', icon: 'assignment', color: '#a78bfa', pct: tasks.length ? (inProgress/Math.max(tasks.length,1))*100 : 0, spark: [5,8,12,10,15,inProgress,inProgress], view: 'tasks' as ActiveView, detail: `${pending} pending` },
          { label: 'Avg Battery', value: `${avgBattery}%`, sub: 'fleet avg', icon: 'battery_4_bar', color: avgBattery > 50 ? '#4ade80' : '#f59e0b', pct: avgBattery, spark: [82,79,74,71,68,72,avgBattery], view: 'fleet' as ActiveView, detail: `${lowBattery} critical` },
          { label: 'Conflicts', value: activeConflicts, sub: 'route conflicts', icon: 'alt_route', color: activeConflicts > 0 ? '#f43f5e' : '#4ade80', pct: activeConflicts > 0 ? 100 : 0, spark: [2,1,3,2,1,0,activeConflicts], view: 'coordination' as ActiveView, detail: 'A* active' },
          { label: 'Completed', value: completed, sub: 'tasks today', icon: 'task_alt', color: '#34d399', pct: tasks.length ? (completed/Math.max(tasks.length,1))*100 : 0, spark: [14,18,22,19,25,28,completed], view: 'tasks' as ActiveView, detail: `${compRate}% success` },
        ].map((k, i) => (
          <button key={i} onClick={() => onNavigate(k.view)}
            className="group relative bg-[#0c0c12] border border-neutral-800/60 rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 hover:border-neutral-700 hover:bg-[#0f0f18] hover:shadow-xl active:scale-[0.97] overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-15" style={{ backgroundColor: k.color }} />
            <div className="relative flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${k.color}18`, border: `1px solid ${k.color}28` }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: k.color }}>{k.icon}</span>
              </div>
              <RingGauge pct={typeof k.pct === 'number' ? k.pct : 0} color={k.color} size={40} strokeW={3.5} />
            </div>
            <div className="relative">
              <div className="text-2xl font-black font-mono mb-0.5" style={{ color: k.color, letterSpacing: '-0.04em' }}>{k.value}</div>
              <div className="text-[11px] font-semibold text-neutral-300 mb-2">{k.label}</div>
              <Sparkline values={k.spark} color={k.color} height={26} />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[9px] text-neutral-600 font-mono">{k.sub}</span>
                <span className="text-[9px] text-neutral-600">{k.detail}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ══════════════ MAIN BENTO GRID ══════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

        {/* Digital Twin Live Map */}
        <div className="xl:col-span-5 bg-[#06060c] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ minHeight: '440px' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>Digital Twin — Live</span>
              <span className="text-[9px] font-mono text-neutral-600 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded-md">50×50 GRID</span>
            </div>
            <button onClick={() => onNavigate('overview')} className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer">
              Full View <span className="material-symbols-outlined text-[14px]">north_east</span>
            </button>
          </div>
          <div className="flex-1 p-3">
            <MiniMap amrs={amrs} onClick={() => onNavigate('overview')} />
          </div>
          <div className="px-5 py-3.5 border-t border-neutral-800/60 grid grid-cols-4 gap-2">
            {[
              { label: 'Active', val: activeAmrs, color: '#4ade80' },
              { label: 'Charging', val: chargingAmrs, color: '#38bdf8' },
              { label: 'Idle', val: idleAmrs, color: '#52525b' },
              { label: 'Blocked', val: blockedAmrs, color: '#f43f5e' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-black font-mono" style={{ color: s.color, letterSpacing: '-0.03em' }}>{s.val}</div>
                <div className="text-[9px] text-neutral-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AMR Fleet Cards */}
        <div className="xl:col-span-3 flex flex-col bg-[#0c0c12] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-sky-400">smart_toy</span>
              <span className="text-sm font-bold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>AMR Fleet</span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded-full">{activeAmrs} live</span>
            </div>
            <button onClick={() => onNavigate('fleet')} className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5 transition-colors">
              Manage <span className="material-symbols-outlined text-[13px]">north_east</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40" style={{ scrollbarWidth: 'none' }}>
            {amrs.map((amr) => {
              const isA = amr.status === 'Active', isC = amr.status === 'Charging';
              const isB = amr.status === 'Blocked' || amr.status === 'Emergency';
              const c = isA ? '#4ade80' : isC ? '#38bdf8' : isB ? '#f43f5e' : '#52525b';
              const taskCode = tasks.find(t => t.id === amr.currentTaskId)?.taskCode;
              return (
                <button key={amr.id} onClick={() => onSelectAmr(amr.id)}
                  className="w-full px-5 py-3.5 hover:bg-white/[0.03] text-left transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}80` }} />
                      <span className="text-sm font-black font-mono text-white">{amr.code}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: c, backgroundColor: `${c}15`, border: `1px solid ${c}25` }}>{amr.status}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">{amr.speed.toFixed(2)} m/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-800/80 h-1 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${amr.batteryLevel}%`, backgroundColor: amr.batteryLevel > 40 ? '#4ade80' : amr.batteryLevel > 20 ? '#f59e0b' : '#f43f5e' }} />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500 w-8 text-right">{amr.batteryLevel}%</span>
                  </div>
                  {taskCode && <div className="mt-1 text-[9px] font-mono text-neutral-600 truncate">↳ {taskCode}</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Activity Feed + API */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Live Activity Feed */}
          <div className="flex-1 bg-[#0c0c12] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl flex flex-col" style={{ minHeight: '240px' }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>Live Activity</span>
                {critAlerts > 0 && <span className="text-[9px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/25 px-1.5 py-0.5 rounded-full animate-pulse">{critAlerts} CRITICAL</span>}
              </div>
              <button onClick={() => onNavigate('alerts')} className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5 transition-colors">
                All <span className="material-symbols-outlined text-[13px]">north_east</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LiveActivityFeed alerts={alerts} tasks={tasks} amrs={amrs} />
            </div>
          </div>

          {/* API Quick Test */}
          <div className="bg-[#080812] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl flex flex-col" style={{ minHeight: '220px' }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-violet-400">api</span>
                <span className="text-sm font-bold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>API Quick Test</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> :5005
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

      {/* ══════════════ PHOTO CONTEXT CARDS ══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80', title: 'Zone B — Rack Operations', subtitle: 'AMR-02 & AMR-04 active', badge: 'OVERHEAD CAM 01', badgeColor: '#4ade80', stat: `${activeAmrs} moving`, view: 'overview' as ActiveView },
          { img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=800&q=80', title: 'Edge AI Perception Feed', subtitle: 'YOLOv8 INT8 · 12.5ms', badge: 'LIVE CCTV', badgeColor: '#38bdf8', stat: '<15ms latency', view: 'edge-ai' as ActiveView },
          { img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', title: 'SIH Judge Demo Scenarios', subtitle: '4 scenarios ready', badge: 'JUDGE MODE', badgeColor: '#f59e0b', stat: 'Demo ready', view: 'simulation' as ActiveView },
        ].map((item, i) => (
          <button key={i} onClick={() => onNavigate(item.view)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer text-left shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            style={{ minHeight: '200px' }}>
            <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)' }} />
            <div className="absolute top-4 left-4">
              <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border"
                style={{ color: item.badgeColor, backgroundColor: `${item.badgeColor}20`, borderColor: `${item.badgeColor}40` }}>
                ● {item.badge}
              </span>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
              <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-white text-[14px]">north_east</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-sm font-bold text-white mb-0.5" style={{ letterSpacing: '-0.01em' }}>{item.title}</div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">{item.subtitle}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: item.badgeColor }}>{item.stat}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ══════════════ BOTTOM ROW — Task Pipeline | System Health ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Task Pipeline */}
        <div className="bg-[#0c0c12] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-violet-400">assignment</span>
              <span className="text-sm font-bold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>Task Pipeline</span>
              <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">{inProgress} running</span>
            </div>
            <button onClick={() => onNavigate('tasks')} className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5 transition-colors">
              Manage <span className="material-symbols-outlined text-[13px]">north_east</span>
            </button>
          </div>
          <div className="px-5 py-3 border-b border-neutral-800/30 flex items-center gap-4">
            {[
              { label: 'Running', val: inProgress, color: '#38bdf8' },
              { label: 'Pending', val: pending, color: '#f59e0b' },
              { label: 'Done', val: completed, color: '#4ade80' },
              { label: 'Failed', val: tasks.filter(t=>t.status==='FAILED').length, color: '#f43f5e' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-mono font-bold" style={{ color: s.color }}>{s.val}</span>
                <span className="text-[9px] text-neutral-600">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="divide-y divide-neutral-800/40 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {tasks.slice(0, 9).map((task) => {
              const sColor = task.status === 'COMPLETED' ? '#4ade80' : task.status === 'IN_TRANSIT' || task.status === 'ASSIGNED' ? '#38bdf8' : task.status === 'FAILED' ? '#f43f5e' : '#52525b';
              const pColor = task.priority === 'CRITICAL' ? '#f43f5e' : task.priority === 'HIGH' ? '#f59e0b' : '#52525b';
              return (
                <div key={task.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: pColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-neutral-200">{task.taskCode}</span>
                      {task.assignedAmrCode && <span className="text-[9px] font-mono text-sky-400">{task.assignedAmrCode}</span>}
                      <span className="text-[9px] font-mono text-neutral-600 ml-auto">{task.priority}</span>
                    </div>
                    <p className="text-[9px] text-neutral-600 truncate mt-0.5">{task.pickupStationName} → {task.dropoffStationName}</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold flex-shrink-0" style={{ color: sColor }}>{task.status.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#0c0c12] border border-neutral-800/60 rounded-3xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">monitor_heart</span>
              <span className="text-sm font-bold text-neutral-100" style={{ letterSpacing: '-0.01em' }}>System Health</span>
            </div>
            <button onClick={() => onNavigate('analytics')} className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-0.5 transition-colors">
              Analytics <span className="material-symbols-outlined text-[13px]">north_east</span>
            </button>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Task Completion', val: `${compRate}%`, pct: compRate, color: '#4ade80', icon: 'task_alt' },
              { label: 'Fleet Uptime', val: '97.4%', pct: 97.4, color: '#38bdf8', icon: 'electrical_services' },
              { label: 'Avg Task Time', val: `${metrics.avgTaskTimeSec || 42}s`, pct: 70, color: '#a78bfa', icon: 'timer' },
              { label: 'Collisions Avoided', val: `${metrics.collisionWarningsAvoidedCount || 124}`, pct: 100, color: '#4ade80', icon: 'verified_user' },
              { label: 'WiFi Latency', val: `${metrics.avgWifiLatencyMs || 14}ms`, pct: 92, color: '#38bdf8', icon: 'wifi' },
              { label: 'Edge AI mAP@50', val: '94.2%', pct: 94.2, color: '#f59e0b', icon: 'psychology' },
            ].map(({ label, val, pct, color, icon }) => (
              <div key={label} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-3.5 flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <RingGauge pct={pct} color={color} size={44} strokeW={4} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px]" style={{ color }}>{icon}</span>
                  </span>
                </div>
                <div>
                  <div className="text-sm font-black font-mono" style={{ color, letterSpacing: '-0.02em' }}>{val}</div>
                  <div className="text-[9px] text-neutral-600 mt-0.5 leading-tight">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-neutral-500">12-Hour Throughput (pallets/hr)</span>
                <span className="text-[10px] font-mono font-bold text-sky-400">{throughput} ph</span>
              </div>
              <Sparkline values={[108,132,148,142,156,161,158,throughput]} color="#38bdf8" height={40} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ QUICK NAV SHORTCUTS ══════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Digital Twin', desc: 'Live 2.5D warehouse map', icon: 'grid_view', view: 'overview' as ActiveView, color: '#38bdf8', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=70' },
          { label: 'Edge AI Vision', desc: '4-camera CCTV & YOLOv8', icon: 'videocam_sensor', view: 'edge-ai' as ActiveView, color: '#4ade80', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=70' },
          { label: 'Judge Demo', desc: 'SIH evaluation scenarios', icon: 'sports_esports', view: 'simulation' as ActiveView, color: '#f59e0b', img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=70' },
          { label: 'Multi-Robot', desc: 'A* conflict resolution', icon: 'alt_route', view: 'coordination' as ActiveView, color: '#a78bfa', img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=400&q=70' },
        ].map(({ label, desc, icon, view, color, img }) => (
          <button key={view} onClick={() => onNavigate(view)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer text-left shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-200 active:scale-[0.98]"
            style={{ minHeight: '110px' }}>
            <img src={img} alt={label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.50) 100%)` }} />
            <div className="relative p-4 flex items-center gap-3 h-full">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}22`, border: `1px solid ${color}38` }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white" style={{ letterSpacing: '-0.01em' }}>{label}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{desc}</div>
              </div>
              <span className="material-symbols-outlined text-neutral-600 group-hover:text-neutral-300 text-[16px] transition-colors">north_east</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
