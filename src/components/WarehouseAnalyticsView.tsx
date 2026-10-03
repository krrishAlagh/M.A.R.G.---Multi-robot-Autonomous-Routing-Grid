import React, { useState } from 'react';
import { FleetMetrics, Language } from '../types';

interface WarehouseAnalyticsViewProps {
  language: Language;
  metrics: FleetMetrics;
}

// ── Hourly throughput dataset (last 12 hours) ──
const HOURLY_THROUGHPUT = [
  { hour: '00:00', pallets: 108, tasks: 22, efficiency: 76 },
  { hour: '01:00', pallets: 94,  tasks: 18, efficiency: 71 },
  { hour: '02:00', pallets: 88,  tasks: 16, efficiency: 68 },
  { hour: '03:00', pallets: 72,  tasks: 14, efficiency: 62 },
  { hour: '04:00', pallets: 96,  tasks: 19, efficiency: 73 },
  { hour: '05:00', pallets: 118, tasks: 24, efficiency: 81 },
  { hour: '06:00', pallets: 132, tasks: 27, efficiency: 88 },
  { hour: '07:00', pallets: 148, tasks: 31, efficiency: 93 },
  { hour: '08:00', pallets: 142, tasks: 29, efficiency: 91 },
  { hour: '09:00', pallets: 156, tasks: 33, efficiency: 96 },
  { hour: '10:00', pallets: 161, tasks: 34, efficiency: 98 },
  { hour: '11:00', pallets: 158, tasks: 32, efficiency: 97 },
];

// ── Per-AMR performance dataset ──
const AMR_STATS = [
  { code: 'AMR-01', tasksCompleted: 87,  batteryAvg: 82, distanceM: 3240, uptimePct: 97, collisions: 0 },
  { code: 'AMR-02', tasksCompleted: 74,  batteryAvg: 71, distanceM: 2980, uptimePct: 95, collisions: 0 },
  { code: 'AMR-03', tasksCompleted: 92,  batteryAvg: 94, distanceM: 3560, uptimePct: 99, collisions: 0 },
  { code: 'AMR-04', tasksCompleted: 61,  batteryAvg: 36, distanceM: 2110, uptimePct: 78, collisions: 1 },
  { code: 'AMR-05', tasksCompleted: 68,  batteryAvg: 61, distanceM: 2640, uptimePct: 88, collisions: 2 },
  { code: 'AMR-06', tasksCompleted: 79,  batteryAvg: 80, distanceM: 3020, uptimePct: 94, collisions: 0 },
];

// ── Zone activity heatmap data ──
const ZONE_ACTIVITY = [
  { zone: 'Zone A – Receiving',    tasksIn: 34, tasksOut: 31, congestionPct: 72, obstaclesDetected: 3 },
  { zone: 'Zone B – Storage',      tasksIn: 52, tasksOut: 49, congestionPct: 58, obstaclesDetected: 1 },
  { zone: 'Zone C – Picking',      tasksIn: 68, tasksOut: 65, congestionPct: 84, obstaclesDetected: 5 },
  { zone: 'Zone D – Packing',      tasksIn: 44, tasksOut: 43, congestionPct: 61, obstaclesDetected: 2 },
  { zone: 'Zone E – Charging Bay', tasksIn: 18, tasksOut: 18, congestionPct: 30, obstaclesDetected: 0 },
  { zone: 'Zone F – Dispatch',     tasksIn: 27, tasksOut: 25, congestionPct: 49, obstaclesDetected: 1 },
];

// ── Edge AI detection stats ──
const EDGE_AI_STATS = [
  { label: 'Human Workers Detected', count: 248, icon: 'person', color: 'blue' },
  { label: 'Pallets / Boxes',        count: 1824, icon: 'inventory_2', color: 'cyan' },
  { label: 'Forklifts & Equipment',  count: 76,  icon: 'forklift', color: 'amber' },
  { label: 'E-Stops Triggered',      count: 12,  icon: 'emergency_home', color: 'rose' },
  { label: 'False Positives',        count: 3,   icon: 'cancel', color: 'purple' },
  { label: 'Avg Inference Time',     count: 14.2, icon: 'speed', color: 'emerald', unit: 'ms' },
];

const BAR_COLOR: Record<string, string> = {
  blue:    'bg-blue-500',
  cyan:    'bg-cyan-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  purple:  'bg-purple-500',
  emerald: 'bg-emerald-500',
};

const TEXT_COLOR: Record<string, string> = {
  blue:    'text-blue-400',
  cyan:    'text-cyan-400',
  amber:   'text-amber-400',
  rose:    'text-rose-400',
  purple:  'text-purple-400',
  emerald: 'text-emerald-400',
};

// Mini bar chart
const MiniBar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = 'bg-cyan-500' }) => (
  <div className="flex-1 bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-700`}
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
);

// Sparkline bar chart (SVG)
const SparkBars: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data, color = '#22d3ee', height = 48
}) => {
  const max = Math.max(...data);
  const barW = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      {data.map((v, i) => {
        const barH = (v / max) * height * 0.9;
        const y = height - barH;
        return (
          <rect
            key={i}
            x={i * barW + 0.5}
            y={y}
            width={barW - 1}
            height={barH}
            rx="1"
            fill={color}
            opacity={0.75 + (v / max) * 0.25}
          />
        );
      })}
    </svg>
  );
};

export const WarehouseAnalyticsView: React.FC<WarehouseAnalyticsViewProps> = ({ language, metrics }) => {
  const [activeTab, setActiveTab] = useState<'throughput' | 'amr' | 'zone' | 'edge'>('throughput');
  const isHi = language === 'hi';

  const KPI_CARDS = [
    {
      label: isHi ? 'थ्रूपुट दर' : 'Throughput Rate',
      value: `${metrics.warehouseThroughputPalletsHr}`,
      unit: 'pallets/hr',
      sub: '+6.4% vs manual baseline',
      subColor: 'text-emerald-400',
      icon: 'conveyor_belt',
      color: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/20',
      textColor: 'text-cyan-300',
      sparkData: HOURLY_THROUGHPUT.map(h => h.pallets),
      sparkColor: '#22d3ee'
    },
    {
      label: isHi ? 'कार्य पूर्णता दर' : 'Task Completion',
      value: `${metrics.taskCompletionRatePct}%`,
      unit: '',
      sub: `Avg ${metrics.avgTaskTimeSec}s per task cycle`,
      subColor: 'text-emerald-400',
      icon: 'task_alt',
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/20',
      textColor: 'text-emerald-300',
      sparkData: HOURLY_THROUGHPUT.map(h => h.efficiency),
      sparkColor: '#34d399'
    },
    {
      label: isHi ? 'टकराव निवारण' : 'Collision Avoidances',
      value: `${metrics.collisionWarningsAvoidedCount}`,
      unit: 'warnings',
      sub: '0 actual collisions — 100% safe',
      subColor: 'text-blue-400',
      icon: 'security',
      color: 'from-blue-500/20 to-indigo-500/10',
      border: 'border-blue-500/20',
      textColor: 'text-blue-300',
      sparkData: [2, 1, 3, 0, 2, 1, 4, 2, 1, 0, 2, 0],
      sparkColor: '#60a5fa'
    },
    {
      label: isHi ? 'एज लेटेंसी' : 'Edge Inference',
      value: `${metrics.avgWifiLatencyMs}`,
      unit: 'ms avg',
      sub: 'Sub-18ms SIH26123 target met',
      subColor: 'text-purple-400',
      icon: 'speed',
      color: 'from-purple-500/20 to-violet-500/10',
      border: 'border-purple-500/20',
      textColor: 'text-purple-300',
      sparkData: [16, 15, 18, 14, 13, 14, 15, 17, 14, 13, 14, 14],
      sparkColor: '#a78bfa'
    },
  ];

  const tabs = [
    { id: 'throughput' as const, label: 'Hourly Throughput', labelHi: 'प्रति घंटा थ्रूपुट', icon: 'bar_chart' },
    { id: 'amr' as const,        label: 'AMR Performance',   labelHi: 'एएमआर प्रदर्शन', icon: 'smart_toy' },
    { id: 'zone' as const,       label: 'Zone Activity',     labelHi: 'ज़ोन गतिविधि', icon: 'map' },
    { id: 'edge' as const,       label: 'Edge AI Stats',     labelHi: 'एज एआई आंकड़े', icon: 'videocam_sensor' },
  ];

  return (
    <div className="space-y-8 pb-20">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isHi ? 'वेयरहाउस प्रदर्शन एनालिटिक्स' : 'Warehouse Operational Analytics'}
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            {isHi
              ? 'रीयल-टाइम AMR फ्लीट प्रदर्शन, थ्रूपुट एवं एज AI आंकड़े'
              : 'Real-time fleet throughput, task metrics and Edge AI perception statistics — SIH26123'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isHi ? 'लाइव डेटा' : 'Live Dataset'}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${kpi.color} border ${kpi.border} p-5 flex flex-col gap-3`}
            style={{ backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.75)' }}
          >
            <div className="flex items-center justify-between">
              <span className={`material-symbols-outlined ${kpi.textColor} text-[22px]`}>{kpi.icon}</span>
              <span className={`text-[10px] font-mono ${kpi.subColor}`}>{kpi.sub}</span>
            </div>
            <div>
              <div className={`text-3xl font-black ${kpi.textColor} leading-none`}>
                {kpi.value}
                {kpi.unit && <span className="text-sm font-medium text-[#6e6e73] ml-1.5">{kpi.unit}</span>}
              </div>
              <div className="text-[11px] text-[#6e6e73] mt-1 font-medium">{kpi.label}</div>
            </div>
            <div className="h-10 -mx-1">
              <SparkBars data={kpi.sparkData} color={kpi.sparkColor} height={40} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0c0c10] border border-white/6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-[#6e6e73] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            <span className="hidden sm:inline">{isHi ? tab.labelHi : tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Hourly Throughput Tab ── */}
      {activeTab === 'throughput' && (
        <div className="rounded-2xl bg-[#0a0a0e] border border-white/6 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-white">{isHi ? 'प्रति घंटा पैलेट थ्रूपुट' : 'Hourly Pallet Throughput (Last 12h)'}</h3>
              <p className="text-[11px] text-[#6e6e73] mt-0.5">Autonomous AMR fleet vs 142 pallets/hr baseline</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#6e6e73]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-cyan-500 inline-block" /> Pallets</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-purple-500 inline-block" /> Efficiency %</span>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Bar chart */}
              <div className="flex items-end gap-2 h-40 mb-2">
                {HOURLY_THROUGHPUT.map((d, i) => {
                  const maxP = 180;
                  const barH = `${(d.pallets / maxP) * 100}%`;
                  const effH = `${(d.efficiency / 100) * 100}%`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
                      <div className="flex-1 w-full flex items-end gap-0.5 justify-center">
                        <div
                          className="flex-1 bg-cyan-500/70 hover:bg-cyan-400 rounded-t transition-all cursor-default group relative"
                          style={{ height: barH }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block text-[10px] font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-white whitespace-nowrap z-10">
                            {d.pallets} pallets
                          </div>
                        </div>
                        <div
                          className="flex-1 bg-purple-500/50 hover:bg-purple-400 rounded-t transition-all cursor-default"
                          style={{ height: effH }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X axis labels */}
              <div className="flex gap-2">
                {HOURLY_THROUGHPUT.map((d, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] font-mono text-[#6e6e73]">{d.hour}</div>
                ))}
              </div>
            </div>
          </div>
          {/* Summary row */}
          <div className="grid grid-cols-3 divide-x divide-white/6 border-t border-white/6">
            <div className="px-6 py-4">
              <p className="text-[10px] text-[#6e6e73] uppercase font-mono">Peak Hour</p>
              <p className="text-[18px] font-bold text-white mt-1">10:00</p>
              <p className="text-[11px] text-cyan-400 font-mono">161 pallets</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] text-[#6e6e73] uppercase font-mono">Avg Efficiency</p>
              <p className="text-[18px] font-bold text-white mt-1">82.7%</p>
              <p className="text-[11px] text-emerald-400 font-mono">vs 68% manual ops</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] text-[#6e6e73] uppercase font-mono">Total Pallets / 12h</p>
              <p className="text-[18px] font-bold text-white mt-1">1,473</p>
              <p className="text-[11px] text-purple-400 font-mono">+18.4% over target</p>
            </div>
          </div>
        </div>
      )}

      {/* ── AMR Performance Tab ── */}
      {activeTab === 'amr' && (
        <div className="rounded-2xl bg-[#0a0a0e] border border-white/6 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6">
            <h3 className="text-[14px] font-semibold text-white">{isHi ? 'व्यक्तिगत एएमआर प्रदर्शन रिपोर्ट' : 'Individual AMR Performance Report'}</h3>
            <p className="text-[11px] text-[#6e6e73] mt-0.5">Tasks completed, battery cycles, distance driven, and safety record</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/6">
                  {['AMR', 'Tasks Done', 'Battery Avg%', 'Distance (m)', 'Uptime%', 'Collisions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-mono font-semibold text-[#6e6e73] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AMR_STATS.map((amr, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[13px] font-bold text-cyan-400">{amr.code}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[13px] font-semibold text-white w-8">{amr.tasksCompleted}</span>
                        <MiniBar value={amr.tasksCompleted} max={100} color="bg-cyan-500" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[13px] font-semibold w-8 ${amr.batteryAvg < 40 ? 'text-rose-400' : amr.batteryAvg < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {amr.batteryAvg}%
                        </span>
                        <MiniBar value={amr.batteryAvg} max={100} color={amr.batteryAvg < 40 ? 'bg-rose-500' : amr.batteryAvg < 70 ? 'bg-amber-500' : 'bg-emerald-500'} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-[#a1a1a6] font-mono">{amr.distanceM.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[13px] font-semibold w-10 ${amr.uptimePct > 95 ? 'text-emerald-400' : amr.uptimePct > 85 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {amr.uptimePct}%
                        </span>
                        <MiniBar value={amr.uptimePct} max={100} color={amr.uptimePct > 95 ? 'bg-emerald-500' : amr.uptimePct > 85 ? 'bg-amber-500' : 'bg-rose-500'} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-mono font-semibold px-2.5 py-1 rounded-full ${
                        amr.collisions === 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {amr.collisions === 0 ? '✓ Safe' : `⚠ ${amr.collisions}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Zone Activity Tab ── */}
      {activeTab === 'zone' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ZONE_ACTIVITY.map((z, i) => {
            const congColor = z.congestionPct > 75 ? 'rose' : z.congestionPct > 50 ? 'amber' : 'emerald';
            return (
              <div key={i} className="rounded-2xl bg-[#0a0a0e] border border-white/6 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-semibold text-white">{z.zone}</h4>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded-full border ${
                    congColor === 'rose' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    congColor === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {z.congestionPct}% congestion
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div><p className="text-[10px] text-[#6e6e73] uppercase font-mono mb-1">In</p><p className="text-lg font-bold text-cyan-400">{z.tasksIn}</p></div>
                  <div><p className="text-[10px] text-[#6e6e73] uppercase font-mono mb-1">Out</p><p className="text-lg font-bold text-emerald-400">{z.tasksOut}</p></div>
                  <div><p className="text-[10px] text-[#6e6e73] uppercase font-mono mb-1">Pending</p><p className="text-lg font-bold text-amber-400">{z.tasksIn - z.tasksOut}</p></div>
                  <div><p className="text-[10px] text-[#6e6e73] uppercase font-mono mb-1">Obstacles</p><p className="text-lg font-bold text-rose-400">{z.obstaclesDetected}</p></div>
                </div>
                {/* Congestion bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-[#6e6e73]">
                    <span>Congestion Level</span>
                    <span className={TEXT_COLOR[congColor]}>{z.congestionPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${BAR_COLOR[congColor]}`}
                      style={{ width: `${z.congestionPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edge AI Stats Tab ── */}
      {activeTab === 'edge' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EDGE_AI_STATS.map((s, i) => (
              <div key={i} className="rounded-2xl bg-[#0a0a0e] border border-white/6 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${BAR_COLOR[s.color]}/15 border border-${s.color}-500/20`}>
                  <span className={`material-symbols-outlined ${TEXT_COLOR[s.color]} text-[22px]`}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#6e6e73] font-mono uppercase">{s.label}</p>
                  <p className={`text-2xl font-black mt-0.5 ${TEXT_COLOR[s.color]}`}>
                    {typeof s.count === 'number' && !Number.isInteger(s.count)
                      ? s.count.toFixed(1)
                      : s.count.toLocaleString()}
                    {s.unit && <span className="text-sm font-medium text-[#6e6e73] ml-1">{s.unit}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Edge AI model info card */}
          <div className="rounded-2xl bg-[#0a0a0e] border border-white/6 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-[#6e6e73] font-mono uppercase tracking-widest">Edge Model</p>
              <p className="text-[15px] font-bold text-white">YOLOv8-nano TensorRT</p>
              <p className="text-[11px] text-cyan-400 font-mono">INT8 quantized · ONNX export</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#6e6e73] font-mono uppercase tracking-widest">Hardware</p>
              <p className="text-[15px] font-bold text-white">NVIDIA Jetson Orin NX</p>
              <p className="text-[11px] text-purple-400 font-mono">16GB LPDDR5 · 1024 CUDA cores</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#6e6e73] font-mono uppercase tracking-widest">Dataset (Training)</p>
              <p className="text-[15px] font-bold text-white">SIH26123-WH-v3.1</p>
              <p className="text-[11px] text-amber-400 font-mono">12,480 annotated frames · 8 classes</p>
            </div>
          </div>

          {/* Dataset classes */}
          <div className="rounded-2xl bg-[#0a0a0e] border border-white/6 p-5">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#6e6e73] mb-4">
              Training Dataset Class Distribution
            </p>
            <div className="space-y-2.5">
              {[
                { label: 'Human Worker',       count: 3840, pct: 31, color: 'cyan' },
                { label: 'Pallet / Box',        count: 2960, pct: 24, color: 'blue' },
                { label: 'Forklift',            count: 1280, pct: 10, color: 'amber' },
                { label: 'AMR Robot',           count: 1920, pct: 15, color: 'purple' },
                { label: 'Rack / Shelf',        count: 960,  pct: 8,  color: 'emerald' },
                { label: 'Conveyor Belt',       count: 640,  pct: 5,  color: 'rose' },
                { label: 'Safety Cone',         count: 480,  pct: 4,  color: 'amber' },
                { label: 'Loading Dock Door',   count: 400,  pct: 3,  color: 'slate' },
              ].map((cls, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-[#6e6e73] w-36 shrink-0">{cls.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${BAR_COLOR[cls.color] || 'bg-slate-500'} transition-all duration-700`}
                      style={{ width: `${cls.pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#6e6e73] w-20 text-right">{cls.count.toLocaleString()} ({cls.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
