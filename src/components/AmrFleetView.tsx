import React, { useState } from 'react';
import { AMR, Language } from '../types';
import { sendAmrCommand } from '../services/api';

interface AmrFleetViewProps {
  language: Language;
  amrs: AMR[];
  onSelectAmr: (id: string) => void;
  onRefresh?: () => void;
}

export const AmrFleetView: React.FC<AmrFleetViewProps> = ({
  language,
  amrs,
  onSelectAmr,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleCommand = async (e: React.MouseEvent, id: string, cmd: 'emergency-stop' | 'return-to-dock' | 'resume') => {
    e.stopPropagation();
    await sendAmrCommand(id, cmd);
    if (onRefresh) onRefresh();
  };

  const filteredAmrs = amrs.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Top Banner & Filter Pills */}
      <div className="bg-[#121215] p-5 rounded-2xl border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">
              {language === 'hi' ? 'स्वायत्त मोबाइल रोबोट (एएमआर) फ्लीट पैनल' : 'Autonomous Mobile Robot (AMR) Industrial Fleet HUD'}
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time operational status, Li-Ion battery discharge curves, drive motor temperatures, and hardware overrides.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
          {['all', 'Active', 'Idle', 'Charging', 'Blocked', 'Emergency'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === status ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* AMR Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAmrs.map((amr) => {
          const isBlocked = amr.status === 'Blocked' || amr.status === 'Emergency';
          const isCharging = amr.status === 'Charging';
          const isActive = amr.status === 'Active';

          const statusColor = isActive
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : isCharging
            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
            : isBlocked
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            : 'bg-neutral-900 text-neutral-400 border-neutral-800';

          return (
            <div
              key={amr.id}
              onClick={() => onSelectAmr(amr.id)}
              className="bg-[#121215] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div>
                
                {/* Robot Code & Status Pulsing LED */}
                <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? 'bg-emerald-400 animate-pulse' : isCharging ? 'bg-sky-400 animate-pulse' : isBlocked ? 'bg-rose-500 animate-ping' : 'bg-neutral-500'
                    }`} />
                    <span className="text-base font-extrabold text-white font-mono tracking-tight">{amr.code}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded border ${statusColor}`}>
                      {amr.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">{amr.model}</span>
                </div>

                {/* Battery Discharge Curve & Sparkline */}
                <div className="bg-[#09090b] p-3 rounded-xl border border-neutral-800/80 mb-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neutral-400">Li-Ion Battery</span>
                    <span className="text-white font-extrabold">{amr.batteryLevel}%</span>
                  </div>

                  {/* Battery Bar Progress */}
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${amr.batteryLevel > 40 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                      style={{ width: `${amr.batteryLevel}%` }}
                    />
                  </div>

                  {/* SVG Sparkline Graph */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-neutral-500">12H DISCHARGE TREND</span>
                    <svg className="w-24 h-4" viewBox="0 0 100 20">
                      <polyline
                        fill="none"
                        stroke={amr.batteryLevel > 40 ? '#4ade80' : '#f43f5e'}
                        strokeWidth="2"
                        points="0,5 20,8 40,6 60,12 80,10 100,16"
                      />
                    </svg>
                  </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 text-[10px] block">POSITION (X,Y)</span>
                    <span className="font-bold text-neutral-200">X: {amr.currentPosition.x}, Y: {amr.currentPosition.y}</span>
                  </div>
                  <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 text-[10px] block">SPEED</span>
                    <span className="font-bold text-emerald-400">{amr.speed.toFixed(2)} m/s</span>
                  </div>
                  <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 text-[10px] block">PAYLOAD</span>
                    <span className="font-bold text-sky-400">{amr.payloadKg} / {amr.maxPayloadKg} kg</span>
                  </div>
                  <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 text-[10px] block">DRIVE TEMP</span>
                    <span className="font-bold text-amber-400">{amr.health.motorTempC} °C</span>
                  </div>
                </div>

              </div>

              {/* Action Override Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-800/80">
                <button
                  onClick={(e) => handleCommand(e, amr.id, 'emergency-stop')}
                  className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>E-STOP</span>
                </button>
                <button
                  onClick={(e) => handleCommand(e, amr.id, 'return-to-dock')}
                  className="flex-1 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>DOCK C1</span>
                </button>
                <button
                  onClick={() => onSelectAmr(amr.id)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
