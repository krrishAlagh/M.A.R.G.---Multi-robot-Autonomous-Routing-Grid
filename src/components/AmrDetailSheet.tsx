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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#121215] border-l border-neutral-800 shadow-2xl backdrop-blur-2xl flex flex-col justify-between p-6 overflow-y-auto space-y-6 font-sans select-none">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-mono tracking-tight">{amr.code}</h3>
              <p className="text-xs text-neutral-400 font-mono">{amr.model}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-base cursor-pointer transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Status Badge & Battery Discharge Curve */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#09090b] border border-neutral-800 p-3 rounded-xl space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono uppercase">OPERATIONAL STATE</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-emerald-400 animate-pulse' : isCharging ? 'bg-sky-400 animate-pulse' : isBlocked ? 'bg-rose-500 animate-ping' : 'bg-neutral-400'
              }`} />
              <span className={`px-2 py-0.5 text-[11px] font-bold font-mono rounded border ${statusColor}`}>
                {amr.status}
              </span>
            </div>
          </div>

          <div className="bg-[#09090b] border border-neutral-800 p-3 rounded-xl space-y-1">
            <div className="text-[10px] text-neutral-500 font-mono uppercase">LI-ION BATTERY</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-extrabold text-white font-mono">{amr.batteryLevel}%</span>
              <div className="w-16 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${amr.batteryLevel > 40 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                  style={{ width: `${amr.batteryLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Edge Telemetry Grid */}
        <div className="space-y-4 mt-5">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Real-Time Edge Telemetry
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#09090b] p-3 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 text-[10px] block">GRID COORDINATES</span>
              <span className="font-bold text-white mt-0.5 block">X: {amr.currentPosition.x}, Y: {amr.currentPosition.y}</span>
            </div>
            <div className="bg-[#09090b] p-3 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 text-[10px] block">LINEAR VELOCITY</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">{amr.speed.toFixed(2)} m/s</span>
            </div>
            <div className="bg-[#09090b] p-3 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 text-[10px] block">MOTOR DRIVE TEMP</span>
              <span className="font-bold text-amber-400 mt-0.5 block">{amr.health.motorTempC.toFixed(1)} °C</span>
            </div>
            <div className="bg-[#09090b] p-3 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 text-[10px] block">WI-FI SIGNAL</span>
              <span className="font-bold text-sky-400 mt-0.5 block">{amr.health.wifiSignalDbm} dBm</span>
            </div>
          </div>

          {/* Active Mission */}
          <div className="bg-[#09090b] border border-neutral-800 p-4 rounded-xl space-y-2">
            <div className="text-[10px] text-neutral-500 font-mono uppercase font-bold">Active Mission Assignment</div>
            {currentTask ? (
              <div>
                <div className="text-xs font-bold text-white font-mono">{currentTask.taskCode}</div>
                <div className="text-xs text-neutral-300 mt-0.5">{currentTask.title}</div>
                <div className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between font-mono">
                  <span>Pickup: {currentTask.pickupStationName}</span>
                  <span>Drop: {currentTask.dropoffStationName}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-500 italic font-mono">No active task assigned. AMR in standby mode.</div>
            )}
          </div>

          {/* Onboard Perception Stream */}
          <div className="space-y-2">
            <div className="text-[10px] text-neutral-500 font-mono uppercase font-bold">Onboard AI Camera Perception Feed</div>
            <div className="relative h-44 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 group">
              <img src={amr.cameraFeedUrl} alt={amr.code} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

              {/* Edge AI Object Detection Box Simulation */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-emerald-400 bg-emerald-400/10 rounded flex items-start p-1">
                <span className="bg-emerald-500 text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded font-mono">
                  Pallet (98.4%)
                </span>
              </div>

              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur text-white text-[10px] font-mono rounded border border-white/10">
                YOLOv8 Edge Perception • 60 FPS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Control Actions */}
      <div className="pt-4 border-t border-neutral-800 space-y-2">
        <div className="text-[10px] text-neutral-500 font-mono uppercase">Manual Operator Override Commands</div>
        <div className="grid grid-cols-3 gap-2 font-mono">
          <button
            onClick={() => handleCommand('emergency-stop')}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            E-STOP
          </button>
          <button
            onClick={() => handleCommand('return-to-dock')}
            className="px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            DOCK C1
          </button>
          <button
            onClick={() => handleCommand('resume')}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            RESUME
          </button>
        </div>
      </div>

    </div>
  );
};
