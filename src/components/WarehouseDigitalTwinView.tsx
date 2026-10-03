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
  const [isInjectingObs, setIsInjectingObs] = useState<boolean>(false);
  const [obsX, setObsX] = useState<number>(24);
  const [obsY, setObsY] = useState<number>(14);

  const gridSize = 50; // 50x50 grid

  const handleInjectObstacle = async () => {
    const res = await injectObstacle({ x: obsX, y: obsY, type: 'Pallet Debris' });
    if (res.success && onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-400 text-2xl">warehouse</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {language === 'hi' ? 'स्मार्ट वेयरहाउस डिजिटल ट्विन' : 'Warehouse Digital Twin Navigation Canvas'}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time top-down 2D indoor grid map tracking storage aisles, stations, obstacle hazards, and AMR navigation paths.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Obstacle Grid (X, Y):</span>
            <input
              type="number"
              min={1}
              max={49}
              value={obsX}
              onChange={(e) => setObsX(parseInt(e.target.value) || 1)}
              className="w-14 bg-slate-800 border border-slate-700 text-white font-mono text-xs rounded-lg p-1.5 text-center"
            />
            <input
              type="number"
              min={1}
              max={49}
              value={obsY}
              onChange={(e) => setObsY(parseInt(e.target.value) || 1)}
              className="w-14 bg-slate-800 border border-slate-700 text-white font-mono text-xs rounded-lg p-1.5 text-center"
            />
            <button
              onClick={handleInjectObstacle}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg cursor-pointer"
            >
              Inject Hazard
            </button>
          </div>
        </div>
      </div>

      {/* Main Digital Twin Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden h-[540px]">
          {/* SVG Map Canvas */}
          <svg viewBox="0 0 50 50" className="w-full h-full bg-slate-950 rounded-xl">
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
                <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.1" />
              </pattern>
            </defs>
            <rect width="50" height="50" fill="url(#grid)" />

            {/* Render Zones */}
            {zones.map((z) => (
              <g key={z.id}>
                <rect
                  x={z.bounds.x}
                  y={z.bounds.y}
                  width={z.bounds.width}
                  height={z.bounds.height}
                  fill={
                    z.type === 'Loading'
                      ? 'rgba(59, 130, 246, 0.08)'
                      : z.type === 'Unloading'
                      ? 'rgba(16, 185, 129, 0.08)'
                      : z.type === 'Charging'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : z.type === 'Restricted'
                      ? 'rgba(239, 68, 68, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)'
                  }
                  stroke={
                    z.type === 'Restricted' ? '#EF4444' : z.type === 'Charging' ? '#6366F1' : 'rgba(255,255,255,0.1)'
                  }
                  strokeWidth="0.2"
                  strokeDasharray={z.type === 'Restricted' ? '0.6,0.6' : undefined}
                  rx="0.5"
                />
                <text
                  x={z.bounds.x + 1}
                  y={z.bounds.y + 2.5}
                  fontSize="1.2"
                  fill="rgba(255,255,255,0.5)"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {z.code}
                </text>
              </g>
            ))}

            {/* Render Stations */}
            {stations.map((st) => (
              <g key={st.id}>
                <circle
                  cx={st.position.x}
                  cy={st.position.y}
                  r="0.9"
                  fill={st.type === 'Pickup' ? '#3B82F6' : st.type === 'Dropoff' ? '#10B981' : '#6366F1'}
                />
                <text
                  x={st.position.x + 1.2}
                  y={st.position.y + 0.4}
                  fontSize="0.9"
                  fill="white"
                  fontFamily="monospace"
                >
                  {st.code}
                </text>
              </g>
            ))}

            {/* Render Obstacles */}
            {obstacles.map((obs) => (
              <g key={obs.id}>
                <rect
                  x={obs.position.x - 0.7}
                  y={obs.position.y - 0.7}
                  width="1.4"
                  height="1.4"
                  fill="#EF4444"
                  rx="0.2"
                />
                <text
                  x={obs.position.x}
                  y={obs.position.y + 0.3}
                  fontSize="0.9"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  !
                </text>
              </g>
            ))}

            {/* Render AMR Planned Routes */}
            {amrs.map((amr) => {
              if (amr.currentRoute.length === 0) return null;
              const points = [amr.currentPosition, ...amr.currentRoute]
                .map((p) => `${p.x},${p.y}`)
                .join(' ');
              return (
                <polyline
                  key={`route-${amr.id}`}
                  points={points}
                  fill="none"
                  stroke={amr.status === 'Active' ? '#3B82F6' : '#94A3B8'}
                  strokeWidth="0.3"
                  strokeDasharray="0.6,0.6"
                  opacity="0.7"
                />
              );
            })}

            {/* Render AMRs */}
            {amrs.map((amr) => {
              const color =
                amr.status === 'Active'
                  ? '#10B981'
                  : amr.status === 'Charging'
                  ? '#3B82F6'
                  : amr.status === 'Blocked' || amr.status === 'Emergency'
                  ? '#EF4444'
                  : '#94A3B8';

              return (
                <g
                  key={amr.id}
                  onClick={() => onSelectAmr(amr.id)}
                  style={{ cursor: 'pointer' }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <circle
                    cx={amr.currentPosition.x}
                    cy={amr.currentPosition.y}
                    r="1.2"
                    fill={color}
                    stroke="#0F172A"
                    strokeWidth="0.3"
                  />
                  <text
                    x={amr.currentPosition.x}
                    y={amr.currentPosition.y + 0.4}
                    fontSize="0.8"
                    fill="#0F172A"
                    fontFamily="monospace"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    {amr.code.replace('AMR-', '')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend & Fleet Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-lg">legend_toggle</span>
            Digital Twin Map Legend
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Active AMR (In Mission)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-300">Charging / Docked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">Blocked / Emergency Stop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-slate-300">Idle / Standby</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-600" />
              <span className="text-slate-300">Obstacle / Debris Hazard</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">Live AMR Nodes</div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {amrs.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onSelectAmr(a.id)}
                  className="p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="font-mono font-bold text-white">{a.code}</span>
                  <span className="font-mono text-slate-300">{a.batteryLevel}% Bat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
