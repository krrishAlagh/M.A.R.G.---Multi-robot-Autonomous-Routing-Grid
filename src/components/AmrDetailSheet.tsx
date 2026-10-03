import React from 'react';
import { AMR, WarehouseTask, Language } from '../types';
import { sendAmrCommand } from '../services/api';

interface AmrDetailSheetProps {
  amr: AMR | null;
  tasks?: WarehouseTask[];
  language: Language;
  onClose: () => void;
  onRefresh?: () => void;
}

export const AmrDetailSheet: React.FC<AmrDetailSheetProps> = ({
  amr,
  tasks = [],
  language,
  onClose,
  onRefresh
}) => {
  if (!amr) return null;

  const currentTask = tasks.find((t) => t.id === amr.currentTaskId || t.assignedAmrId === amr.id);

  const handleCommand = async (cmd: 'emergency-stop' | 'return-to-dock' | 'resume') => {
    const res = await sendAmrCommand(amr.id, cmd);
    if (res.success && onRefresh) {
      onRefresh();
    }
  };

  const statusColor =
    amr.status === 'Active'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : amr.status === 'Charging'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : amr.status === 'Blocked' || amr.status === 'Emergency'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      : 'bg-slate-700/40 text-slate-300 border-slate-700';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col justify-between p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-xl">smart_toy</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono tracking-wider">{amr.code}</h3>
              <p className="text-xs text-slate-400">{amr.model}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:text-white text-slate-400 flex items-center justify-center text-lg cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Status Badge & Battery Level */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Operational State</div>
            <div className="mt-1">
              <span className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded-full border ${statusColor}`}>
                ● {amr.status}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Li-Ion Battery</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black text-white font-mono">{amr.batteryLevel}%</span>
              <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${amr.batteryLevel > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${amr.batteryLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry & Health */}
        <div className="space-y-4 mt-6">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Real-Time Edge Telemetry
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Grid Coordinates</div>
              <div className="font-mono font-bold text-white mt-0.5">X: {amr.currentPosition.x}, Y: {amr.currentPosition.y}</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Linear Velocity</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">{amr.speed.toFixed(2)} m/s</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Motor Drive Temp</div>
              <div className="font-mono font-bold text-slate-200 mt-0.5">{amr.health.motorTempC.toFixed(1)} °C</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Wi-Fi Signal</div>
              <div className="font-mono font-bold text-blue-400 mt-0.5">{amr.health.wifiSignalDbm} dBm</div>
            </div>
          </div>

          {/* Current Mission */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="text-[11px] text-slate-400 font-mono uppercase font-bold">Active Mission Assignment</div>
            {currentTask ? (
              <div>
                <div className="text-xs font-bold text-white font-mono">{currentTask.taskCode}</div>
                <div className="text-xs text-slate-300 mt-0.5">{currentTask.title}</div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between font-mono">
                  <span>Pickup: {currentTask.pickupStationName}</span>
                  <span>Drop: {currentTask.dropoffStationName}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">No active task assigned. AMR in standby mode.</div>
            )}
          </div>

          {/* Camera Perception Stream */}
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-mono uppercase font-bold">Onboard AI Camera Perception Feed</div>
            <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
              <img src={amr.cameraFeedUrl} alt={amr.code} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

              {/* Edge AI Object Detection Box Simulation */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-emerald-400 bg-emerald-400/10 rounded flex items-start p-1">
                <span className="bg-emerald-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded">
                  Pallet (98.4%)
                </span>
              </div>

              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur text-white text-[10px] font-mono rounded">
                YOLOv8 Edge Perception • 30 FPS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Control Actions */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <div className="text-[10px] text-slate-400 font-mono uppercase">Manual Operator Override Commands</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleCommand('emergency-stop')}
            className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            E-STOP
          </button>
          <button
            onClick={() => handleCommand('return-to-dock')}
            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            DOCK C1
          </button>
          <button
            onClick={() => handleCommand('resume')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            RESUME
          </button>
        </div>
      </div>
    </div>
  );
};
