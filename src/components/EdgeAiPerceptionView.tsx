import React, { useState } from 'react';
import { EdgePerceptionDetection, Language } from '../types';

interface EdgeAiPerceptionViewProps {
  language: Language;
  perceptions: EdgePerceptionDetection[];
}

export const EdgeAiPerceptionView: React.FC<EdgeAiPerceptionViewProps> = ({
  language,
  perceptions
}) => {
  const [visionMode, setVisionMode] = useState<'RGB' | 'Thermal' | 'NightVision'>('RGB');
  const [activeCam, setActiveCam] = useState<string>('cam-1');
  const [confThreshold, setConfThreshold] = useState<number>(0.75);

  const cameras = [
    { id: 'cam-1', name: 'Overhead Cam 01 (Aisle 3)', amrCode: 'AMR-01', location: 'Zone B Picking' },
    { id: 'cam-2', name: 'AMR-01 Monocular Vision', amrCode: 'AMR-01', location: 'Dock C1 Approach' },
    { id: 'cam-3', name: 'AMR-03 Front LiDAR/Camera', amrCode: 'AMR-03', location: 'Zone C Storage' },
    { id: 'cam-4', name: 'AMR-06 Backup Sensor', amrCode: 'AMR-06', location: 'Zone A Receiving' },
  ];

  const filterStyle =
    visionMode === 'Thermal'
      ? 'hue-rotate-180 invert saturate-200 contrast-150'
      : visionMode === 'NightVision'
      ? 'sepia-100 hue-rotate-90 contrast-200 brightness-75'
      : '';

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Top Banner & Controls */}
      <div className="bg-[#121215] p-5 rounded-2xl border border-neutral-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">videocam_sensor</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">
              {language === 'hi' ? 'एज एआई विज़न सीसीसीटीवी मॉनिटर' : 'Edge-AI CCTV Perception & Vision Intelligence Monitor'}
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              ● 12.5ms INT8 LATENCY
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Local embedded TensorRT vision inference running onboard NVIDIA Jetson Orin NX for instant obstacle extraction.
          </p>
        </div>

        {/* Vision Mode Selector & Slider */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setVisionMode('RGB')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                visionMode === 'RGB' ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              RGB Vision
            </button>
            <button
              onClick={() => setVisionMode('Thermal')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                visionMode === 'Thermal' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Thermal
            </button>
            <button
              onClick={() => setVisionMode('NightVision')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                visionMode === 'NightVision' ? 'bg-emerald-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Night-Vision
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-neutral-400">Min Conf:</span>
            <input
              type="range"
              min={0.5}
              max={0.95}
              step={0.05}
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              className="w-20 accent-sky-500 cursor-pointer"
            />
            <span className="text-sky-400 font-bold">{(confThreshold * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Main CCTV Monitor & Side Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main CCTV Feed Panel */}
        <div className="lg:col-span-2 bg-[#0a0a0f] border border-neutral-800 rounded-2xl p-4 shadow-2xl relative space-y-4">
          
          {/* Active Camera Header */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-300 border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold text-white">LIVE CCTV: {cameras.find(c => c.id === activeCam)?.name}</span>
            </div>
            <span className="text-sky-400">YOLOv8 INT8 · 60.0 FPS</span>
          </div>

          {/* Interactive Feed Monitor Screen */}
          <div className="relative h-[380px] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 group">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
              alt="Industrial Warehouse CCTV"
              className={`w-full h-full object-cover transition-all duration-300 ${filterStyle}`}
            />
            
            {/* Dynamic Laser Scanning Line Animation */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-75 shadow-lg shadow-emerald-400/50 animate-pulse top-1/3" />

            {/* Dynamic Bounding Box Overlay 1 */}
            <div className="absolute top-1/3 left-1/3 w-40 h-28 border-2 border-emerald-400 bg-emerald-400/10 rounded-lg flex flex-col justify-between p-1.5 shadow-lg shadow-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-500 text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded font-mono">
                  Pallet (98.4%)
                </span>
                <span className="text-emerald-400 font-mono text-[9px] font-bold">ID: #PL-2041</span>
              </div>
              <div className="text-[9px] font-mono text-emerald-300 bg-black/60 px-1 py-0.5 rounded backdrop-blur">
                X: 24.2, Y: 14.8 | Dist: 1.4m
              </div>
            </div>

            {/* Dynamic Bounding Box Overlay 2 */}
            <div className="absolute bottom-1/4 right-1/4 w-36 h-24 border-2 border-sky-400 bg-sky-400/10 rounded-lg flex flex-col justify-between p-1.5 shadow-lg shadow-sky-500/20">
              <div className="flex items-center justify-between">
                <span className="bg-sky-500 text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded font-mono">
                  AMR-03 (99.1%)
                </span>
                <span className="text-sky-400 font-mono text-[9px] font-bold">ID: #ROBOT-03</span>
              </div>
              <div className="text-[9px] font-mono text-sky-300 bg-black/60 px-1 py-0.5 rounded backdrop-blur">
                Speed: 1.25 m/s | Charging Dock
              </div>
            </div>

            {/* HUD Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
            </div>

            {/* HUD Footer Information Bar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1 bg-black/80 backdrop-blur border border-white/10 rounded-lg text-[10px] font-mono text-neutral-300">
              <span>TARGET INFERENCE: 12.5ms</span>
              <span>BANDWIDTH SAVINGS: 94.2%</span>
              <span>MODEL: NEXUS-YOLOV8-M</span>
            </div>
          </div>

          {/* Camera Selection Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cameras.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCam(c.id)}
                className={`p-2 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                  activeCam === c.id
                    ? 'bg-sky-500/20 border-sky-500 text-white font-bold shadow-md shadow-sky-500/10'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <p className="truncate text-white font-bold">{c.name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{c.location}</p>
              </button>
            ))}
          </div>

        </div>

        {/* Live Edge Detection Telemetry Feed Panel */}
        <div className="bg-[#121215] border border-neutral-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 border-b border-neutral-800 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-base">sensors</span>
              <span>Edge Telemetry Stream</span>
            </h3>

            {/* Detections List */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto no-scrollbar">
              {perceptions.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{p.objectClass}</span>
                    <span className="text-neutral-400 text-[10px]">{(p.confidence * 100).toFixed(1)}% Conf</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Node: {p.amrCode}</span>
                    <span>X:{p.location.x}, Y:{p.location.y}</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${p.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-400 text-center">
            ✔ Jetson Orin Hardware Accelerated INT8 Quantization
          </div>

        </div>

      </div>

    </div>
  );
};
