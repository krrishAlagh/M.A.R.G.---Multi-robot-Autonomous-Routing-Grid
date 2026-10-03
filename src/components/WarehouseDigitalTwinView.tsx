import React, { useState } from 'react';
import { AMR, WarehouseZone, WarehouseStation, WarehouseObstacle, Language } from '../types';
import { injectObstacle } from '../services/api';

interface WarehouseDigitalTwinViewProps {
  language: Language;
  amrs: AMR[];
  zones: WarehouseZone[];
  stations: WarehouseStation[];
  obstacles: WarehouseObstacle[];
  onSelectAmr: (id: string) => void;
  onRefresh?: () => void;
}

export const WarehouseDigitalTwinView: React.FC<WarehouseDigitalTwinViewProps> = ({
  language,
  amrs,
  zones,
  stations,
  obstacles,
  onSelectAmr,
  onRefresh
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [obsX, setObsX] = useState<number>(24);
  const [obsY, setObsY] = useState<number>(14);
  const [obsType, setObsType] = useState<string>('Pallet Debris');
  const [isInjecting, setIsInjecting] = useState<boolean>(false);

  const handleInjectObstacle = async () => {
    setIsInjecting(true);
    const res = await injectObstacle({ x: obsX, y: obsY, type: obsType });
    setIsInjecting(false);
    if (res.success && onRefresh) {
      onRefresh();
    }
  };

  const filteredAmrs = selectedZone === 'all' 
    ? amrs 
    : amrs.filter(a => {
        const zone = zones.find(z => z.id === selectedZone);
        if (!zone) return true;
        const p = a.currentPosition;
        return p.x >= zone.bounds.x && p.x <= zone.bounds.x + zone.bounds.width &&
               p.y >= zone.bounds.y && p.y <= zone.bounds.y + zone.bounds.height;
      });

  return (
    <div className="space-y-6 select-none">
      
      {/* ── Top Header & Hazard Injection Bar ── */}
      <div className="bg-[#121215] p-5 rounded-2xl border border-neutral-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">
              {language === 'hi' ? '2.5D डिजिटल जुड़वा वेयरहाउस कैनवास' : '2.5D Photorealistic Digital Twin Navigation Canvas'}
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              ● 60 FPS MESH
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time top-down 2.5D spatial map tracking AMR trajectories, storage rack aisles, obstacle hazards, and charging docks.
          </p>
        </div>

        {/* Hazard Injector */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-900/90 border border-neutral-800 p-2 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <span>X:</span>
            <input
              type="number"
              min={1}
              max={49}
              value={obsX}
              onChange={(e) => setObsX(parseInt(e.target.value) || 1)}
              className="w-12 bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono text-xs rounded p-1 text-center"
            />
            <span>Y:</span>
            <input
              type="number"
              min={1}
              max={49}
              value={obsY}
              onChange={(e) => setObsY(parseInt(e.target.value) || 1)}
              className="w-12 bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono text-xs rounded p-1 text-center"
            />
          </div>

          <select
            value={obsType}
            onChange={(e) => setObsType(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 font-mono text-xs rounded p-1.5"
          >
            <option value="Pallet Debris">Fallen Pallet Box</option>
            <option value="Human Worker">Caution Worker Zone</option>
            <option value="Oil Spill">Hydraulic Fluid Spill</option>
          </select>

          <button
            onClick={handleInjectObstacle}
            disabled={isInjecting}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>{isInjecting ? 'Injecting...' : 'Inject Hazard'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Canvas & Legend Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 2.5D Isometric HTML5/SVG Canvas Container */}
        <div className="lg:col-span-3 bg-[#0a0a0f] border border-neutral-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden h-[560px] flex flex-col justify-between">
          
          {/* Canvas HUD Status Overlay */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-neutral-950/80 backdrop-blur border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-neutral-300">GRID: 50x50 METRIC</span>
            <span className="text-neutral-600">|</span>
            <span className="text-sky-400 font-bold">{amrs.filter(a => a.status === 'Active').length} Active AMRs</span>
          </div>

          <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur border border-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedZone('all')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                selectedZone === 'all' ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Zones
            </button>
            {zones.map(z => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                  selectedZone === z.id ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {z.code}
              </button>
            ))}
          </div>

          {/* SVG 2.5D Isometric Industrial Canvas */}
          <svg viewBox="0 0 50 50" className="w-full h-full bg-[#07070a] rounded-xl select-none">
            
            {/* Dark Metallic Industrial Floor Pattern */}
            <defs>
              <pattern id="metalGrid" width="2" height="2" patternUnits="userSpaceOnUse">
                <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.08" />
              </pattern>
              
              {/* LED Spotlight Vector Gradient */}
              <radialGradient id="spotlightGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
              </radialGradient>

              {/* Dynamic Hazard Stripe Pattern */}
              <pattern id="hazardStripes" width="2" height="2" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <rect width="1" height="2" fill="rgba(234, 179, 8, 0.15)" />
                <rect x="1" width="1" height="2" fill="rgba(0, 0, 0, 0.4)" />
              </pattern>
            </defs>

            {/* Base Floor Grid */}
            <rect width="50" height="50" fill="url(#metalGrid)" />

            {/* Warehouse Storage Zones & Hazard Borders */}
            {zones.map((z) => {
              const isSelected = selectedZone === 'all' || selectedZone === z.id;
              return (
                <g key={z.id} opacity={isSelected ? 1 : 0.25}>
                  <rect
                    x={z.bounds.x}
                    y={z.bounds.y}
                    width={z.bounds.width}
                    height={z.bounds.height}
                    fill={
                      z.type === 'Loading'
                        ? 'rgba(56, 189, 248, 0.05)'
                        : z.type === 'Unloading'
                        ? 'rgba(74, 222, 128, 0.05)'
                        : z.type === 'Charging'
                        ? 'rgba(168, 85, 247, 0.08)'
                        : z.type === 'Restricted'
                        ? 'url(#hazardStripes)'
                        : 'rgba(255, 255, 255, 0.02)'
                    }
                    stroke={
                      z.type === 'Restricted'
                        ? '#f43f5e'
                        : z.type === 'Charging'
                        ? '#a855f7'
                        : 'rgba(255, 255, 255, 0.08)'
                    }
                    strokeWidth="0.25"
                    rx="0.8"
                  />
                  <text
                    x={z.bounds.x + 1}
                    y={z.bounds.y + 2.5}
                    fontSize="1.1"
                    fill="rgba(255,255,255,0.4)"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {z.code} · {z.name}
                  </text>
                </g>
              );
            })}

            {/* Warehouse High-Density Storage Rack Structures */}
            <g opacity="0.35">
              <rect x="12" y="8" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />
              <rect x="12" y="14" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />
              <rect x="12" y="20" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />
              <rect x="12" y="26" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />

              <rect x="30" y="8" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />
              <rect x="30" y="14" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />
              <rect x="30" y="20" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />
              <rect x="30" y="26" width="14" height="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.15" rx="0.3" />
            </g>

            {/* Warehouse Dock Stations */}
            {stations.map((st) => (
              <g key={st.id}>
                <circle
                  cx={st.position.x}
                  cy={st.position.y}
                  r="1.1"
                  fill={st.type === 'Pickup' ? '#38bdf8' : st.type === 'Dropoff' ? '#4ade80' : '#a855f7'}
                  opacity="0.25"
                />
                <circle
                  cx={st.position.x}
                  cy={st.position.y}
                  r="0.5"
                  fill={st.type === 'Pickup' ? '#38bdf8' : st.type === 'Dropoff' ? '#4ade80' : '#a855f7'}
                />
                <text
                  x={st.position.x + 1.2}
                  y={st.position.y + 0.3}
                  fontSize="0.85"
                  fill="#a1a1aa"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {st.code}
                </text>
              </g>
            ))}

            {/* Dynamic Obstacles & Caution Hazard Icons */}
            {obstacles.map((obs) => (
              <g key={obs.id}>
                <rect
                  x={obs.position.x - 0.8}
                  y={obs.position.y - 0.8}
                  width="1.6"
                  height="1.6"
                  fill="#f43f5e"
                  opacity="0.3"
                  rx="0.3"
                />
                <rect
                  x={obs.position.x - 0.6}
                  y={obs.position.y - 0.6}
                  width="1.2"
                  height="1.2"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="0.15"
                  rx="0.2"
                />
                <text
                  x={obs.position.x}
                  y={obs.position.y + 0.3}
                  fontSize="0.8"
                  fill="#ffffff"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ⚠
                </text>
              </g>
            ))}

            {/* Glowing AMR Path Trajectory Polylines */}
            {amrs.map((amr) => {
              if (amr.currentRoute.length === 0) return null;
              const points = [amr.currentPosition, ...amr.currentRoute]
                .map((p) => `${p.x},${p.y}`)
                .join(' ');
              return (
                <g key={`route-${amr.id}`}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={amr.status === 'Active' ? '#38bdf8' : '#71717a'}
                    strokeWidth="0.4"
                    strokeDasharray="0.8,0.8"
                    opacity="0.8"
                  />
                </g>
              );
            })}

            {/* Photorealistic AMR Robot Nodes */}
            {filteredAmrs.map((amr) => {
              const statusColor =
                amr.status === 'Active'
                  ? '#4ade80'
                  : amr.status === 'Charging'
                  ? '#38bdf8'
                  : amr.status === 'Blocked' || amr.status === 'Emergency'
                  ? '#f43f5e'
                  : '#a1a1aa';

              return (
                <g
                  key={amr.id}
                  onClick={() => onSelectAmr(amr.id)}
                  style={{ cursor: 'pointer' }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {/* Spotlight Vector */}
                  <ellipse
                    cx={amr.currentPosition.x}
                    cy={amr.currentPosition.y}
                    rx="2.2"
                    ry="2.2"
                    fill="url(#spotlightGrad)"
                  />

                  {/* Pulsing Outer Status Ring */}
                  <circle
                    cx={amr.currentPosition.x}
                    cy={amr.currentPosition.y}
                    r="1.5"
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="0.2"
                    opacity="0.7"
                  />

                  {/* Robot Chassis Base */}
                  <rect
                    x={amr.currentPosition.x - 0.9}
                    y={amr.currentPosition.y - 0.9}
                    width="1.8"
                    height="1.8"
                    fill="#18181b"
                    stroke={statusColor}
                    strokeWidth="0.25"
                    rx="0.4"
                  />

                  {/* Inner Robot Core */}
                  <circle
                    cx={amr.currentPosition.x}
                    cy={amr.currentPosition.y}
                    r="0.5"
                    fill={statusColor}
                  />

                  {/* AMR Label Code */}
                  <text
                    x={amr.currentPosition.x}
                    y={amr.currentPosition.y + 0.25}
                    fontSize="0.55"
                    fill="#000000"
                    fontFamily="monospace"
                    fontWeight="extrabold"
                    textAnchor="middle"
                  >
                    {amr.code.replace('AMR-', '')}
                  </text>
                </g>
              );
            })}

          </svg>

          {/* Canvas Footer Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-t border-neutral-800/80 pt-2">
            <span>MAP SCALE: 1:1 METRIC GRID</span>
            <span>A* SPATIO-TEMPORAL PATHING ACTIVE</span>
          </div>

        </div>

        {/* Legend & AMR Node Selector */}
        <div className="bg-[#121215] border border-neutral-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 border-b border-neutral-800 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-400 text-base">legend_toggle</span>
              <span>Visual Legend</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-neutral-300">Active AMR (Moving)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-neutral-300">Charging / Docked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-neutral-300">Blocked / E-Stop Lock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                <span className="text-neutral-300">Idle Standby</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-rose-600" />
                <span className="text-neutral-300">Hazard / Debris Marker</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-neutral-800">
            <div className="text-xs font-mono font-bold text-neutral-400 uppercase">Fleet Robot Nodes</div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
              {amrs.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectAmr(a.id)}
                  className="w-full p-2 bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      a.status === 'Active' ? 'bg-emerald-400' : a.status === 'Charging' ? 'bg-sky-400' : 'bg-rose-500'
                    }`} />
                    <span className="font-mono font-bold text-neutral-100">{a.code}</span>
                  </div>
                  <span className="font-mono text-neutral-400 text-[11px]">{a.batteryLevel}%</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
