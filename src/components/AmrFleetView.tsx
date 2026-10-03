import React, { useState } from 'react';
import { AMR, AmrStatus, Language } from '../types';
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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-400 text-2xl">smart_toy</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {language === 'hi' ? 'स्वायत्त मोबाइल रोबोट (एएमआर) बेड़ा' : 'Autonomous Mobile Robot (AMR) Fleet Control'}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Monitor battery state-of-charge, operational telemetry, motors, and emergency overrides across all active AMRs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          {['all', 'Active', 'Idle', 'Charging', 'Blocked', 'Emergency'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                filterStatus === status ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* AMR Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAmrs.map((amr) => {
          const statusColor =
            amr.status === 'Active'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : amr.status === 'Charging'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : amr.status === 'Blocked' || amr.status === 'Emergency'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700';

          return (
            <div
              key={amr.id}
              onClick={() => onSelectAmr(amr.id)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white font-mono tracking-wider">{amr.code}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full border ${statusColor}`}>
                      ● {amr.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{amr.model}</span>
                </div>

                {/* Battery Indicator Bar */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Li-Ion Battery</span>
                    <span className="text-white font-bold">{amr.batteryLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${amr.batteryLevel > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${amr.batteryLevel}%` }}
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Position:</span> X:{amr.currentPosition.x}, Y:{amr.currentPosition.y}
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Speed:</span> {amr.speed.toFixed(1)} m/s
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Payload:</span> {amr.payloadKg} / {amr.maxPayloadKg} kg
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-400 text-[10px]">Motor Temp:</span> {amr.health.motorTempC} °C
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={(e) => handleCommand(e, amr.id, 'emergency-stop')}
                  className="flex-1 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold rounded-lg transition-all"
                >
                  E-Stop
                </button>
                <button
                  onClick={(e) => handleCommand(e, amr.id, 'return-to-dock')}
                  className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold rounded-lg transition-all"
                >
                  Dock
                </button>
                <button
                  onClick={() => onSelectAmr(amr.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg"
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
