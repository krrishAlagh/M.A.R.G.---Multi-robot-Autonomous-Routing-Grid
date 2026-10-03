import React, { useState } from 'react';
import { Language, UserRole } from '../types';

interface SettingsViewProps {
  language: Language;
  onToggleLanguage: () => void;
  userRole: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  userRole
}) => {
  const [distanceWeight, setDistanceWeight] = useState(35);
  const [batteryWeight, setBatteryWeight] = useState(25);
  const [workloadWeight, setWorkloadWeight] = useState(20);
  const [edgeConfidence, setEdgeConfidence] = useState(88);
  const [estopBufferCm, setEstopBufferCm] = useState(30);

  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {language === 'hi' ? 'प्रणाली सेटिंग्स एवं कॉन्फ़िगरेशन' : 'NEXUS AMR OS Parameters & Preferences'}
            </h1>
            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-mono">
              SIH26123 Configuration
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure Fleet Allocation scoring weights, Sub-18ms Edge perception thresholds, and A* collision avoidance buffers.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-base">save</span>
          Save Configuration
        </button>
      </section>

      {savedToast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-2 animate-bounce max-w-5xl">
          <span className="material-symbols-outlined text-base">check_circle</span>
          Configuration parameters successfully saved and deployed to Edge AI Fleet nodes!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Card 1: Task Allocation Scoring Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="material-symbols-outlined text-cyan-400">equalizer</span>
            <h3 className="font-semibold text-sm text-white">Task Allocation Scoring Algorithm Weights</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Distance Weight (W_dist)</span>
              <span className="font-mono font-bold text-cyan-400">{distanceWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={distanceWeight}
              onChange={(e) => setDistanceWeight(Number(e.target.value))}
              className="accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Battery Level Weight (W_bat)</span>
              <span className="font-mono font-bold text-emerald-400">{batteryWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={batteryWeight}
              onChange={(e) => setBatteryWeight(Number(e.target.value))}
              className="accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Queue Workload Weight (W_work)</span>
              <span className="font-mono font-bold text-purple-400">{workloadWeight}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={workloadWeight}
              onChange={(e) => setWorkloadWeight(Number(e.target.value))}
              className="accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Card 2: Edge Perception & E-Stop */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="material-symbols-outlined text-rose-400">videocam_sensor</span>
            <h3 className="font-semibold text-sm text-white">Edge Perception & E-Stop Safety Buffers</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">TensorRT Object Detection Min Confidence</span>
              <span className="font-mono font-bold text-amber-400">{edgeConfidence}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="99"
              value={edgeConfidence}
              onChange={(e) => setEdgeConfidence(Number(e.target.value))}
              className="accent-amber-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">
              Detections under {edgeConfidence}% trigger warnings without hard emergency brake stops.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Sub-18ms E-Stop Buffer Radius</span>
              <span className="font-mono font-bold text-rose-400">{estopBufferCm} cm</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={estopBufferCm}
              onChange={(e) => setEstopBufferCm(Number(e.target.value))}
              className="accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 mt-2">
            <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
            <span>Current Role: <strong>{userRole}</strong> (Authenticated)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

