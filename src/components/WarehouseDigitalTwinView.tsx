import React, { useState, useEffect, useRef } from 'react';
import { AMR, WarehouseZone, WarehouseStation, WarehouseObstacle, Language } from '../types';
import { injectObstacle, clearObstacle } from '../services/api';

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
  const [tick, setTick] = useState(0);
  const [hoveredAmr, setHoveredAmr] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'topdown' | 'heatmap'>('topdown');
  const [showGrid, setShowGrid] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [fps, setFps] = useState(0);
  const lastFrameRef = useRef<number>(Date.now());
  const fpsCountRef = useRef<number>(0);

  // Real-time animation tick for smooth pulsing, path animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      fpsCountRef.current += 1;
      const now = Date.now();
      if (now - lastFrameRef.current >= 1000) {
        setFps(fpsCountRef.current);
        fpsCountRef.current = 0;
        lastFrameRef.current = now;
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleInjectObstacle = async () => {
    setIsInjecting(true);
    const res = await injectObstacle({ x: obsX, y: obsY, type: obsType });
    setIsInjecting(false);
    if (res.success && onRefresh) {
      onRefresh();
    }
  };

  const handleClearObstacle = async (id: string) => {
    const res = await clearObstacle(id);
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

  const activeCount = amrs.filter(a => a.status === 'Active').length;
  const chargingCount = amrs.filter(a => a.status === 'Charging').length;
  const blockedCount = amrs.filter(a => a.status === 'Blocked' || a.status === 'Emergency').length;
  const avgBattery = amrs.length ? Math.round(amrs.reduce((s, a) => s + a.batteryLevel, 0) / amrs.length) : 0;

  // Animated dash offset for path animations
  const dashOffset = (tick * 2) % 20;

  return (
    <div className="space-y-5 select-none font-sans">

      {/* ── Top Command Header ── */}
      <div className="bg-[#0f0f12] border border-neutral-800/80 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-400 text-[20px]">precision_manufacturing</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                  {language === 'hi' ? '2.5D रियल-टाइम डिजिटल ट्विन वेयरहाउस' : 'Live 2.5D Digital Twin Navigation Canvas'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    LIVE · {fps}fps
                  </span>
                  <span className="text-neutral-700 text-xs">|</span>
                  <span className="text-[10px] font-mono text-neutral-500">50×50 METRIC GRID · A* PATHFINDING ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stats Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">{activeCount} ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-sky-400 font-bold">⚡ {chargingCount} CHARGING</span>
            </div>
            {blockedCount > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-rose-400 font-bold animate-pulse">⚠ {blockedCount} BLOCKED</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-neutral-400">AVG BATT:</span>
              <span className={`font-bold ${avgBattery > 40 ? 'text-emerald-400' : 'text-rose-400'}`}>{avgBattery}%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-900/20 border border-rose-800/30 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-rose-400">🔴 {obstacles.length} HAZARDS</span>
            </div>
          </div>
        </div>

        {/* ── Controls Row ── */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-neutral-800/80">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-mono">
            <button onClick={() => setViewMode('topdown')} className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'topdown' ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}>
              Top-Down
            </button>
            <button onClick={() => setViewMode('heatmap')} className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'heatmap' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'}`}>
              Traffic Heatmap
            </button>
          </div>

          {/* Show/Hide Toggles */}
          <button onClick={() => setShowGrid(!showGrid)} className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${showGrid ? 'bg-neutral-800 border-neutral-700 text-white' : 'border-neutral-800 text-neutral-500'}`}>
            Grid Lines
          </button>
          <button onClick={() => setShowPaths(!showPaths)} className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${showPaths ? 'bg-neutral-800 border-neutral-700 text-white' : 'border-neutral-800 text-neutral-500'}`}>
            Show Routes
          </button>

          {/* Zone Filter */}
          <div className="flex items-center gap-1 ml-auto bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-[11px] font-mono">
            <button onClick={() => setSelectedZone('all')} className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${selectedZone === 'all' ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}>All</button>
            {zones.map(z => (
              <button key={z.id} onClick={() => setSelectedZone(z.id)} className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${selectedZone === z.id ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}>{z.code}</button>
            ))}
          </div>

          {/* Hazard Injector */}
          <div className="flex flex-wrap items-center gap-2 bg-neutral-900/70 border border-rose-900/30 p-2 rounded-xl">
            <span className="text-[10px] text-rose-400 font-mono font-bold">INJECT HAZARD:</span>
            <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
              <span>X:</span>
              <input type="number" min={1} max={49} value={obsX} onChange={(e) => setObsX(parseInt(e.target.value) || 1)}
                className="w-10 bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono text-xs rounded p-1 text-center" />
              <span>Y:</span>
              <input type="number" min={1} max={49} value={obsY} onChange={(e) => setObsY(parseInt(e.target.value) || 1)}
                className="w-10 bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono text-xs rounded p-1 text-center" />
            </div>
            <select value={obsType} onChange={(e) => setObsType(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 text-neutral-200 font-mono text-xs rounded p-1">
              <option value="Pallet Debris">Fallen Pallet</option>
              <option value="Human Worker">Caution Zone</option>
              <option value="Oil Spill">Fluid Spill</option>
            </select>
            <button onClick={handleInjectObstacle} disabled={isInjecting}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">warning</span>
              <span>{isInjecting ? 'Injecting...' : 'Inject'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* ── 2.5D SVG Canvas ── */}
        <div className="xl:col-span-4 bg-[#07070c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative" style={{ height: '580px' }}>

          {/* HUD Top-Left overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur border border-neutral-800 px-3 py-1.5 rounded-xl text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-neutral-300">NEXUS SPATIAL ENGINE v3.2</span>
              <span className="text-neutral-600">|</span>
              <span className="text-sky-400">WS://localhost:5005</span>
            </div>
            <div className="bg-black/70 backdrop-blur border border-neutral-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-neutral-400">
              COORD SYS: <span className="text-white">CARTESIAN 2D</span> · SCALE: <span className="text-sky-400">1m/unit</span>
            </div>
          </div>

          {/* HUD Top-Right: Clock */}
          <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur border border-neutral-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-neutral-400">
            <LiveClock />
          </div>

          <svg
            viewBox="0 0 50 50"
            className="w-full h-full"
            style={{ background: 'radial-gradient(ellipse at 50% 30%, #0d1117 0%, #070709 100%)' }}
          >
            <defs>
              {/* Subtle metallic floor grid */}
              <pattern id="floorGrid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.06" />
              </pattern>
              <pattern id="floorGrid5" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.1" />
              </pattern>

              {/* AMR spotlight gradient */}
              <radialGradient id="amrSpot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.3)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0)" />
              </radialGradient>
              <radialGradient id="amrSpotGreen" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(74,222,128,0.25)" />
                <stop offset="100%" stopColor="rgba(74,222,128,0)" />
              </radialGradient>
              <radialGradient id="amrSpotRed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(244,63,94,0.3)" />
                <stop offset="100%" stopColor="rgba(244,63,94,0)" />
              </radialGradient>

              {/* Heatmap gradient */}
              <radialGradient id="heatHot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(239,68,68,0.5)" />
                <stop offset="100%" stopColor="rgba(239,68,68,0)" />
              </radialGradient>

              {/* Hazard pattern */}
              <pattern id="hazardStripes" width="2" height="2" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <rect width="1" height="2" fill="rgba(234,179,8,0.25)" />
                <rect x="1" width="1" height="2" fill="rgba(0,0,0,0.5)" />
              </pattern>

              {/* Dock charging glow */}
              <radialGradient id="dockGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(168,85,247,0.4)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0)" />
              </radialGradient>
            </defs>

            {/* Base floor */}
            {showGrid && (
              <>
                <rect width="50" height="50" fill="url(#floorGrid)" />
                <rect width="50" height="50" fill="url(#floorGrid5)" />
              </>
            )}

            {/* Warehouse Border */}
            <rect x="0.5" y="0.5" width="49" height="49" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" rx="0.5" />

            {/* Main Traffic Corridor / Aisle */}
            <rect x="0" y="22" width="50" height="6" fill="rgba(56,189,248,0.03)" stroke="none" />
            <line x1="0" y1="22" x2="50" y2="22" stroke="rgba(234,179,8,0.2)" strokeWidth="0.15" strokeDasharray="2,1" />
            <line x1="0" y1="28" x2="50" y2="28" stroke="rgba(234,179,8,0.2)" strokeWidth="0.15" strokeDasharray="2,1" />
            <text x="1" y="25.5" fontSize="1" fill="rgba(234,179,8,0.4)" fontFamily="monospace" fontWeight="bold">MAIN AISLE — AUTHORIZED AMRS ONLY</text>

            {/* Vertical aisle */}
            <rect x="22" y="0" width="6" height="50" fill="rgba(56,189,248,0.02)" stroke="none" />
            <line x1="22" y1="0" x2="22" y2="50" stroke="rgba(234,179,8,0.15)" strokeWidth="0.12" strokeDasharray="2,1" />
            <line x1="28" y1="0" x2="28" y2="50" stroke="rgba(234,179,8,0.15)" strokeWidth="0.12" strokeDasharray="2,1" />

            {/* Warehouse Zones */}
            {zones.map((z) => {
              const isSelected = selectedZone === 'all' || selectedZone === z.id;
              const zoneColor =
                z.type === 'Loading' ? 'rgba(56,189,248,' :
                z.type === 'Unloading' ? 'rgba(74,222,128,' :
                z.type === 'Charging' ? 'rgba(168,85,247,' :
                z.type === 'Restricted' ? 'rgba(244,63,94,' :
                'rgba(255,255,255,';
              return (
                <g key={z.id} opacity={isSelected ? 1 : 0.2}>
                  <rect
                    x={z.bounds.x} y={z.bounds.y}
                    width={z.bounds.width} height={z.bounds.height}
                    fill={z.type === 'Restricted' ? 'url(#hazardStripes)' : `${zoneColor}0.04)`}
                    stroke={
                      z.type === 'Restricted' ? 'rgba(244,63,94,0.5)' :
                      z.type === 'Charging' ? 'rgba(168,85,247,0.4)' :
                      z.type === 'Loading' ? 'rgba(56,189,248,0.25)' :
                      z.type === 'Unloading' ? 'rgba(74,222,128,0.25)' :
                      'rgba(255,255,255,0.07)'
                    }
                    strokeWidth="0.2"
                    rx="0.5"
                  />
                  {/* Zone Label */}
                  <text x={z.bounds.x + 0.8} y={z.bounds.y + 2} fontSize="0.9" fill={`${zoneColor}0.6)`} fontFamily="monospace" fontWeight="bold">{z.code}</text>
                  <text x={z.bounds.x + 0.8} y={z.bounds.y + 3.2} fontSize="0.7" fill="rgba(255,255,255,0.25)" fontFamily="monospace">{z.name}</text>
                </g>
              );
            })}

            {/* High-Density Storage Rack Structures */}
            {[
              [2, 4, 8, 1.5], [2, 7, 8, 1.5], [2, 10, 8, 1.5], [2, 13, 8, 1.5], [2, 17, 8, 1.5],
              [12, 4, 8, 1.5], [12, 7, 8, 1.5], [12, 10, 8, 1.5], [12, 13, 8, 1.5], [12, 17, 8, 1.5],
              [30, 4, 8, 1.5], [30, 7, 8, 1.5], [30, 10, 8, 1.5], [30, 13, 8, 1.5], [30, 17, 8, 1.5],
              [40, 4, 8, 1.5], [40, 7, 8, 1.5], [40, 10, 8, 1.5], [40, 13, 8, 1.5],
              [2, 30, 8, 1.5], [2, 33, 8, 1.5], [2, 36, 8, 1.5], [2, 39, 8, 1.5],
              [12, 30, 8, 1.5], [12, 33, 8, 1.5], [12, 36, 8, 1.5], [12, 39, 8, 1.5],
              [30, 30, 8, 1.5], [30, 33, 8, 1.5], [30, 36, 8, 1.5], [30, 39, 8, 1.5],
              [40, 30, 8, 1.5], [40, 33, 8, 1.5], [40, 36, 8, 1.5],
            ].map(([x, y, w, h], i) => (
              <g key={`rack-${i}`} opacity={viewMode === 'heatmap' ? 0.2 : 1}>
                <rect x={x} y={y} width={w} height={h} fill="#0f0f13" stroke="#2a2a35" strokeWidth="0.12" rx="0.2" />
                {/* Rack shelf lines */}
                <line x1={x} y1={y + h / 3} x2={x + w} y2={y + h / 3} stroke="#1e1e28" strokeWidth="0.1" />
                <line x1={x} y1={y + (2 * h) / 3} x2={x + w} y2={y + (2 * h) / 3} stroke="#1e1e28" strokeWidth="0.1" />
                {/* Rack label */}
                <text x={x + 0.3} y={y + 1} fontSize="0.55" fill="rgba(100,100,120,0.7)" fontFamily="monospace">R{String(i + 1).padStart(2, '0')}</text>
              </g>
            ))}

            {/* Charging Dock Stations (with glow) */}
            {stations.filter(s => s.type === 'Charging').map((st) => {
              const pulseSize = 1.5 + Math.sin(tick * 0.3) * 0.3;
              return (
                <g key={`dock-${st.id}`}>
                  <ellipse cx={st.position.x} cy={st.position.y} rx={pulseSize + 1} ry={pulseSize + 1} fill="url(#dockGlow)" />
                  <circle cx={st.position.x} cy={st.position.y} r="1.2" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.6)" strokeWidth="0.2" />
                  <circle cx={st.position.x} cy={st.position.y} r="0.45" fill="#a855f7" />
                  <text x={st.position.x} y={st.position.y + 2} fontSize="0.7" fill="rgba(168,85,247,0.7)" fontFamily="monospace" textAnchor="middle">{st.code}</text>
                </g>
              );
            })}

            {/* Pickup / Dropoff stations */}
            {stations.filter(s => s.type !== 'Charging').map((st) => {
              const color = st.type === 'Pickup' ? '#38bdf8' : '#4ade80';
              return (
                <g key={`st-${st.id}`}>
                  <rect x={st.position.x - 1} y={st.position.y - 0.8} width="2" height="1.6" fill={`${color}18`} stroke={`${color}60`} strokeWidth="0.18" rx="0.3" />
                  <circle cx={st.position.x} cy={st.position.y} r="0.35" fill={color} />
                  <text x={st.position.x + 1.3} y={st.position.y + 0.3} fontSize="0.7" fill={color} fontFamily="monospace" fontWeight="bold" opacity="0.7">{st.code}</text>
                </g>
              );
            })}

            {/* Heatmap Overlay */}
            {viewMode === 'heatmap' && filteredAmrs.map((amr) => (
              <ellipse
                key={`heat-${amr.id}`}
                cx={amr.currentPosition.x}
                cy={amr.currentPosition.y}
                rx="5" ry="5"
                fill="url(#heatHot)"
                opacity="0.6"
              />
            ))}

            {/* Dynamic Obstacle Hazard Markers */}
            {obstacles.map((obs) => {
              const blink = (Math.floor(tick / 3)) % 2 === 0;
              return (
                <g key={obs.id} opacity={blink ? 1 : 0.6}>
                  <rect x={obs.position.x - 1.2} y={obs.position.y - 1.2} width="2.4" height="2.4" fill="rgba(244,63,94,0.15)" rx="0.4" />
                  <rect x={obs.position.x - 0.9} y={obs.position.y - 0.9} width="1.8" height="1.8" fill="#f43f5e" stroke="#fff" strokeWidth="0.2" rx="0.3" />
                  <text x={obs.position.x} y={obs.position.y + 0.35} fontSize="0.9" fill="#ffffff" textAnchor="middle" fontFamily="monospace" fontWeight="bold">⚠</text>
                  <text x={obs.position.x} y={obs.position.y + 1.8} fontSize="0.6" fill="rgba(244,63,94,0.8)" textAnchor="middle" fontFamily="monospace">{obs.type?.substring(0, 8)}</text>
                </g>
              );
            })}

            {/* AMR Route Polylines (animated) */}
            {showPaths && amrs.map((amr) => {
              if (amr.currentRoute.length === 0) return null;
              const pts = [amr.currentPosition, ...amr.currentRoute].map((p) => `${p.x},${p.y}`).join(' ');
              const color = amr.status === 'Active' ? '#38bdf8' : amr.status === 'Charging' ? '#a855f7' : '#71717a';
              return (
                <polyline
                  key={`route-${amr.id}`}
                  points={pts}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.35"
                  strokeDasharray="1.5,1"
                  strokeDashoffset={-dashOffset}
                  opacity={hoveredAmr === amr.id ? 1 : 0.5}
                />
              );
            })}

            {/* AMR Robot Nodes */}
            {filteredAmrs.map((amr) => {
              const isActive = amr.status === 'Active';
              const isCharging = amr.status === 'Charging';
              const isBlocked = amr.status === 'Blocked' || amr.status === 'Emergency';
              const isHovered = hoveredAmr === amr.id;

              const statusColor = isActive ? '#4ade80' : isCharging ? '#38bdf8' : isBlocked ? '#f43f5e' : '#a1a1aa';
              const spotGrad = isActive ? 'url(#amrSpotGreen)' : isBlocked ? 'url(#amrSpotRed)' : 'url(#amrSpot)';

              const pulseRing = isBlocked
                ? 1.8 + Math.sin(tick * 0.8) * 0.5
                : isActive
                ? 1.8 + Math.sin(tick * 0.3) * 0.25
                : 1.8;

              return (
                <g
                  key={amr.id}
                  onClick={() => onSelectAmr(amr.id)}
                  onMouseEnter={() => setHoveredAmr(amr.id)}
                  onMouseLeave={() => setHoveredAmr(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Spotlight glow */}
                  <ellipse cx={amr.currentPosition.x} cy={amr.currentPosition.y} rx={isHovered ? 5 : 3.5} ry={isHovered ? 5 : 3.5} fill={spotGrad} />

                  {/* Outer animated ring */}
                  <circle cx={amr.currentPosition.x} cy={amr.currentPosition.y} r={pulseRing} fill="none" stroke={statusColor} strokeWidth="0.18" opacity={isHovered ? 0.9 : 0.5} />

                  {/* Inner ring */}
                  <circle cx={amr.currentPosition.x} cy={amr.currentPosition.y} r="1.25" fill="none" stroke={statusColor} strokeWidth="0.12" opacity="0.4" />

                  {/* Chassis body */}
                  <rect
                    x={amr.currentPosition.x - 0.95}
                    y={amr.currentPosition.y - 0.95}
                    width="1.9" height="1.9"
                    fill="#111117"
                    stroke={statusColor}
                    strokeWidth={isHovered ? 0.35 : 0.22}
                    rx="0.4"
                  />

                  {/* Direction indicator (front) */}
                  <polygon
                    points={`${amr.currentPosition.x},${amr.currentPosition.y - 1.5} ${amr.currentPosition.x - 0.4},${amr.currentPosition.y - 1} ${amr.currentPosition.x + 0.4},${amr.currentPosition.y - 1}`}
                    fill={statusColor}
                    opacity="0.7"
                  />

                  {/* Core LED */}
                  <circle cx={amr.currentPosition.x} cy={amr.currentPosition.y} r="0.38" fill={statusColor} />

                  {/* AMR code label */}
                  <text
                    x={amr.currentPosition.x}
                    y={amr.currentPosition.y + 0.15}
                    fontSize="0.45"
                    fill="#000"
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {amr.code.replace('AMR-', '')}
                  </text>

                  {/* Hover info card */}
                  {isHovered && (
                    <g>
                      <rect x={amr.currentPosition.x + 1.6} y={amr.currentPosition.y - 3.5} width="10" height="5.5" fill="#0f0f12" stroke={statusColor} strokeWidth="0.18" rx="0.5" opacity="0.97" />
                      <text x={amr.currentPosition.x + 2.1} y={amr.currentPosition.y - 2.3} fontSize="0.9" fill={statusColor} fontFamily="monospace" fontWeight="bold">{amr.code}</text>
                      <text x={amr.currentPosition.x + 2.1} y={amr.currentPosition.y - 1.1} fontSize="0.7" fill="rgba(255,255,255,0.7)" fontFamily="monospace">Status: {amr.status}</text>
                      <text x={amr.currentPosition.x + 2.1} y={amr.currentPosition.y + 0.1} fontSize="0.7" fill="rgba(255,255,255,0.7)" fontFamily="monospace">Batt: {amr.batteryLevel}%</text>
                      <text x={amr.currentPosition.x + 2.1} y={amr.currentPosition.y + 1.3} fontSize="0.7" fill="rgba(255,255,255,0.7)" fontFamily="monospace">Speed: {amr.speed.toFixed(2)}m/s</text>
                      <text x={amr.currentPosition.x + 2.1} y={amr.currentPosition.y + 2.5} fontSize="0.7" fill="rgba(255,255,255,0.5)" fontFamily="monospace">X:{amr.currentPosition.x.toFixed(1)} Y:{amr.currentPosition.y.toFixed(1)}</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Coordinate labels along axes */}
            {[0, 10, 20, 30, 40, 50].map(v => (
              <g key={`axis-${v}`}>
                <text x={v + 0.3} y={0.9} fontSize="0.65" fill="rgba(255,255,255,0.15)" fontFamily="monospace">{v}</text>
                <text x={0.3} y={v + 0.9} fontSize="0.65" fill="rgba(255,255,255,0.15)" fontFamily="monospace">{v}</text>
              </g>
            ))}
          </svg>

          {/* Bottom HUD bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-black/70 backdrop-blur border-t border-neutral-800/80 text-[10px] font-mono">
            <div className="flex items-center gap-4 text-neutral-400">
              <span>COORD: <span className="text-white">CARTESIAN</span></span>
              <span>SCALE: <span className="text-sky-400">1m/UNIT</span></span>
              <span>PATHING: <span className="text-emerald-400">A* STA ACTIVE</span></span>
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <span>CONFLICTS: <span className="text-amber-400">0</span></span>
              <span>GRID: <span className="text-white">50×50</span></span>
              <span className="text-emerald-400">● TELEMETRY LIVE</span>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Live Fleet Telemetry ── */}
        <div className="xl:col-span-1 flex flex-col gap-4">

          {/* Legend */}
          <div className="bg-[#0f0f12] border border-neutral-800 p-4 rounded-2xl shadow-xl">
            <h3 className="text-xs font-bold text-neutral-300 uppercase mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-400 text-sm">legend_toggle</span>
              Legend
            </h3>
            <div className="space-y-2 text-[11px] font-mono">
              {[
                { color: 'bg-emerald-400', label: 'Active AMR' },
                { color: 'bg-sky-400', label: 'Charging' },
                { color: 'bg-rose-500', label: 'Blocked/E-Stop' },
                { color: 'bg-neutral-400', label: 'Idle Standby' },
                { color: 'bg-purple-500', label: 'Charge Dock' },
                { color: 'bg-rose-600', label: '⚠ Hazard Marker' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                  <span className="text-neutral-400">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="w-2 h-0.5 bg-amber-400/60" style={{ borderTop: '1px dashed', width: '8px' }} />
                <span className="text-neutral-400">AMR Route</span>
              </div>
            </div>
          </div>

          {/* Live AMR telemetry list */}
          <div className="bg-[#0f0f12] border border-neutral-800 p-4 rounded-2xl shadow-xl flex-1">
            <h3 className="text-xs font-bold text-neutral-300 uppercase mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-sm">smart_toy</span>
              Fleet Nodes
            </h3>
            <div className="space-y-2 max-h-[340px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {amrs.map((a) => {
                const isA = a.status === 'Active';
                const isC = a.status === 'Charging';
                const isB = a.status === 'Blocked' || a.status === 'Emergency';
                const dotColor = isA ? 'bg-emerald-400 animate-pulse' : isC ? 'bg-sky-400 animate-pulse' : isB ? 'bg-rose-500' : 'bg-neutral-500';
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelectAmr(a.id)}
                    onMouseEnter={() => setHoveredAmr(a.id)}
                    onMouseLeave={() => setHoveredAmr(null)}
                    className="w-full p-2.5 bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className="text-xs font-mono font-bold text-white">{a.code}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{a.batteryLevel}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${a.batteryLevel > 40 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                        style={{ width: `${a.batteryLevel}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-mono text-neutral-500">{a.speed.toFixed(2)} m/s</span>
                      <span className="text-[10px] font-mono text-neutral-600">{a.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: Warehouse Photo Reference Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
            title: 'Zone B — Active AMR Operations',
            desc: 'AMR-02 & AMR-04 executing high-priority pick-and-place tasks in dense rack aisle environment.',
            badge: 'OVERHEAD CAM 01', badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
          },
          {
            img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
            title: 'Zone A — Receiving Dock',
            desc: 'Goods receiving dock with autonomous conveyor integration. AMR-01 docked for pallet transfer.',
            badge: 'DOCK CAM 02', badgeColor: 'text-sky-400 bg-sky-400/10 border-sky-400/30'
          },
          {
            img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
            title: 'Control Room — Operator Dashboard',
            desc: 'NEXUS AMR OS operator console showing live telemetry dashboards, SIH26123 monitoring systems.',
            badge: 'CONTROL ROOM', badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30'
          }
        ].map((item, i) => (
          <div key={i} className="relative bg-[#0a0a0f] border border-neutral-800 rounded-2xl overflow-hidden group shadow-xl">
            <div className="relative h-44 overflow-hidden">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-black/30" />
              <span className={`absolute top-3 left-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                ● {item.badge}
              </span>
            </div>
            <div className="p-3">
              <h4 className="text-xs font-bold text-neutral-100 mb-1">{item.title}</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Live clock sub-component
const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  useEffect(() => {
    const i = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <span className="text-neutral-200 font-bold">
      {time} <span className="text-neutral-600 font-normal">IST</span>
    </span>
  );
};
