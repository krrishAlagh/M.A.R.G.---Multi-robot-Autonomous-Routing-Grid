import React, { useState, useEffect } from 'react';
import { EdgePerceptionDetection, Language } from '../types';

interface EdgeAiPerceptionViewProps {
  language: Language;
  perceptions: EdgePerceptionDetection[];
}

const CAMERAS = [
  {
    id: 'cam-1',
    name: 'Overhead CAM-01',
    location: 'Zone B · Aisle 3',
    amrCode: 'AMR-01',
    fps: '60.0',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cam-2',
    name: 'AMR-01 Front Cam',
    location: 'Dock C1 Approach',
    amrCode: 'AMR-01',
    fps: '30.0',
    img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cam-3',
    name: 'AMR-03 Monocular',
    location: 'Zone C · Storage',
    amrCode: 'AMR-03',
    fps: '30.0',
    img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cam-4',
    name: 'Zone A Perimeter',
    location: 'Zone A · Receiving',
    amrCode: 'AMR-06',
    fps: '25.0',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
  },
];

const BBOXES = [
  [
    { label: 'Pallet Stack', conf: 98.4, id: '#PL-2041', color: '#4ade80', x: '30%', y: '25%', w: '28%', h: '30%', dist: '1.4m' },
    { label: 'AMR-03', conf: 99.1, id: '#ROBOT-03', color: '#38bdf8', x: '60%', y: '55%', w: '22%', h: '22%', dist: '3.2m' },
    { label: 'Worker Zone', conf: 87.2, id: '#WZ-009', color: '#f59e0b', x: '10%', y: '50%', w: '18%', h: '28%', dist: '5.8m' },
  ],
  [
    { label: 'Pallet Debris', conf: 94.1, id: '#OBS-014', color: '#f43f5e', x: '40%', y: '35%', w: '20%', h: '22%', dist: '0.9m' },
    { label: 'Barcode QR', conf: 99.8, id: '#QR-5512', color: '#4ade80', x: '65%', y: '20%', w: '15%', h: '18%', dist: '0.5m' },
  ],
  [
    { label: 'Forklift', conf: 92.6, id: '#FK-001', color: '#f59e0b', x: '5%', y: '40%', w: '35%', h: '40%', dist: '6.1m' },
    { label: 'Storage Rack', conf: 99.3, id: '#RACK-B3', color: '#4ade80', x: '50%', y: '10%', w: '45%', h: '80%', dist: '4.5m' },
  ],
  [
    { label: 'Human Worker', conf: 88.7, id: '#HW-003', color: '#f59e0b', x: '25%', y: '30%', w: '18%', h: '40%', dist: '2.8m' },
    { label: 'Conveyor', conf: 97.2, id: '#CONV-02', color: '#38bdf8', x: '45%', y: '60%', w: '50%', h: '30%', dist: '3.9m' },
  ]
];

export const EdgeAiPerceptionView: React.FC<EdgeAiPerceptionViewProps> = ({
  language,
  perceptions
}) => {
  const [visionMode, setVisionMode] = useState<'RGB' | 'Thermal' | 'NightVision'>('RGB');
  const [activeCam, setActiveCam] = useState<string>('cam-1');
  const [confThreshold, setConfThreshold] = useState<number>(0.75);
  const [showBBoxes, setShowBBoxes] = useState(true);
  const [showReticle, setShowReticle] = useState(true);
  const [inferenceCount, setInferenceCount] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setInferenceCount(c => c + 1), 800);
    return () => clearInterval(iv);
  }, []);

  const camIdx = CAMERAS.findIndex(c => c.id === activeCam);
  const activeCamData = CAMERAS[camIdx] || CAMERAS[0];
  const bboxes = (BBOXES[camIdx] || BBOXES[0]).filter(b => b.conf / 100 >= confThreshold);

  const filterStyle =
    visionMode === 'Thermal'
      ? 'hue-rotate-180 invert saturate-200 contrast-150 brightness-90'
      : visionMode === 'NightVision'
      ? 'sepia-100 hue-rotate-90 contrast-200 brightness-60 saturate-150'
      : '';

  const filterLabel =
    visionMode === 'Thermal' ? 'FLIR THERMAL · 640×512' :
    visionMode === 'NightVision' ? 'NIGHT-VIS · IR ENHANCED' :
    'RGB · 1920×1080';

  return (
    <div className="space-y-5 select-none font-sans">

      {/* ── Top Command Banner ── */}
      <div className="bg-[#0f0f12] border border-neutral-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">videocam_sensor</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {language === 'hi' ? 'एज एआई पर्सेप्शन — सीसीटीवी विज़न मॉनिटर' : 'Edge-AI CCTV Perception & Vision Intelligence Monitor'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                    REC · LIVE
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">YOLOv8 INT8 · 12.5ms INFERENCE</span>
                  <span className="text-[10px] font-mono text-neutral-500">Jetson Orin NX · TensorRT 8.6</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Vision Mode */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-mono">
              {(['RGB', 'Thermal', 'NightVision'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setVisionMode(mode)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    visionMode === mode
                      ? mode === 'RGB' ? 'bg-sky-500 text-white'
                      : mode === 'Thermal' ? 'bg-amber-500 text-black'
                      : 'bg-emerald-500 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode === 'NightVision' ? 'NV' : mode}
                </button>
              ))}
            </div>

            {/* BBox toggle */}
            <button
              onClick={() => setShowBBoxes(!showBBoxes)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                showBBoxes ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-neutral-800 text-neutral-500'
              }`}
            >
              Detections
            </button>

            {/* Reticle toggle */}
            <button
              onClick={() => setShowReticle(!showReticle)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                showReticle ? 'bg-sky-500/20 border-sky-500/40 text-sky-400' : 'border-neutral-800 text-neutral-500'
              }`}
            >
              HUD Reticle
            </button>

            {/* Confidence */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-neutral-500">Min Conf:</span>
              <input
                type="range" min={0.5} max={0.95} step={0.05}
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="w-20 accent-sky-500 cursor-pointer"
              />
              <span className="text-sky-400 font-bold w-8">{Math.round(confThreshold * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main CCTV Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Main Feed + Camera Switcher ── */}
        <div className="xl:col-span-2 space-y-3">

          {/* Primary CCTV Monitor */}
          <div className="bg-[#07070c] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">

            {/* Monitor HUD Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-black/60">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-white">{activeCamData.name}</span>
                <span className="text-[10px] font-mono text-neutral-500">· {activeCamData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                <span className="text-amber-400">{filterLabel}</span>
                <span>{activeCamData.fps} FPS</span>
                <span className="text-emerald-400">● STREAMING</span>
              </div>
            </div>

            {/* Camera Feed */}
            <div className="relative" style={{ height: '400px' }}>
              <img
                src={activeCamData.img}
                alt={activeCamData.name}
                className={`w-full h-full object-cover transition-all duration-300 ${filterStyle}`}
              />

              {/* Scan line effect */}
              <div
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent pointer-events-none"
                style={{
                  top: `${((inferenceCount * 3) % 100)}%`,
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(74,222,128,0.6)'
                }}
              />

              {/* CRT-style overlay */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

              {/* Detection Bounding Boxes */}
              {showBBoxes && bboxes.map((box, i) => (
                <div
                  key={i}
                  className="absolute transition-all duration-300"
                  style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                >
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: box.color }} />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: box.color }} />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: box.color }} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: box.color }} />
                  <div className="absolute inset-0 rounded" style={{ backgroundColor: `${box.color}08` }} />

                  {/* Label */}
                  <div
                    className="absolute -top-5 left-0 text-[9px] font-mono font-bold text-black px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{ backgroundColor: box.color }}
                  >
                    {box.label} · {box.conf.toFixed(1)}%
                  </div>

                  {/* Info */}
                  <div
                    className="absolute -bottom-5 left-0 text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap backdrop-blur"
                    style={{ color: box.color, backgroundColor: 'rgba(0,0,0,0.7)' }}
                  >
                    {box.id} · Δ{box.dist}
                  </div>
                </div>
              ))}

              {/* HUD Reticle */}
              {showReticle && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border border-white/10 rounded-full" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/80" />
                  </div>
                </div>
              )}

              {/* HUD Top-Left Info */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <div className="bg-black/80 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-mono text-neutral-300">
                  NODE: <span className="text-sky-400 font-bold">{activeCamData.amrCode}</span> · SENSOR FUSION
                </div>
                <div className="bg-black/80 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-mono text-emerald-400">
                  OBJECTS: {bboxes.length} · INFERENCE #{inferenceCount.toString().padStart(5, '0')}
                </div>
              </div>

              {/* HUD Bottom Bar */}
              <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur border-t border-white/5 text-[9px] font-mono">
                <span className="text-neutral-400">LATENCY: <span className="text-emerald-400">12.5ms</span></span>
                <span className="text-neutral-400">MODEL: <span className="text-white">NEXUS-YOLOV8-M-INT8</span></span>
                <span className="text-neutral-400">BWIDTH SAVINGS: <span className="text-sky-400">94.2%</span></span>
                <span className="text-neutral-400">EDGE CPU: <span className="text-amber-400">23%</span></span>
              </div>
            </div>
          </div>

          {/* Camera Selector Grid */}
          <div className="grid grid-cols-4 gap-2">
            {CAMERAS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveCam(c.id)}
                className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all ${
                  activeCam === c.id ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="relative h-20">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {activeCam === c.id && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping block" />
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <p className="text-[9px] font-mono font-bold text-white truncate">{c.name}</p>
                    <p className="text-[8px] font-mono text-neutral-400 truncate">{c.location}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Live Perception Telemetry ── */}
        <div className="flex flex-col gap-4">

          {/* Inference Stats */}
          <div className="bg-[#0f0f12] border border-neutral-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-sm">sensors</span>
              Edge AI Performance
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { label: 'Inference', value: '12.5ms', color: 'text-emerald-400' },
                { label: 'Throughput', value: '80 FPS', color: 'text-sky-400' },
                { label: 'Model Size', value: '12.4MB', color: 'text-violet-400' },
                { label: 'Precision', value: 'INT8', color: 'text-amber-400' },
                { label: 'mAP@50', value: '94.2%', color: 'text-emerald-400' },
                { label: 'GPU Mem', value: '1.8 GB', color: 'text-neutral-300' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-neutral-900/60 border border-neutral-800 p-2.5 rounded-xl">
                  <div className="text-neutral-600 text-[9px] uppercase">{label}</div>
                  <div className={`font-bold text-sm ${color}`}>{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-mono text-emerald-400 text-center">
              ✔ NVIDIA Jetson Orin NX · TensorRT Optimized
            </div>
          </div>

          {/* Live Detections Feed */}
          <div className="bg-[#0f0f12] border border-neutral-800 rounded-2xl p-4 shadow-xl flex-1">
            <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-400 text-sm">track_changes</span>
              Live Detection Stream
            </h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {perceptions.length > 0 ? perceptions.map((p) => (
                <div key={p.id} className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1.5 text-[10px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{p.objectClass}</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${(p.confidence * 100) > 90 ? 'text-emerald-400' : (p.confidence * 100) > 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {(p.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>{p.amrCode}</span>
                    <span>X:{p.location.x.toFixed(1)}, Y:{p.location.y.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${(p.confidence * 100) > 90 ? 'bg-emerald-400' : (p.confidence * 100) > 75 ? 'bg-amber-400' : 'bg-rose-400'}`}
                      style={{ width: `${p.confidence * 100}%` }}
                    />
                  </div>
                </div>
              )) : (
                // Show bboxes from current cam as fallback
                bboxes.map((b, i) => (
                  <div key={i} className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1.5 text-[10px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: b.color }}>{b.label}</span>
                      <span className="font-bold text-emerald-400">{b.conf.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>{b.id}</span>
                      <span>Δ {b.dist}</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${b.conf}%`, backgroundColor: b.color }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Object Class Legend */}
          <div className="bg-[#0f0f12] border border-neutral-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase mb-2">Tracked Classes</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Pallet', color: '#4ade80' },
                { label: 'AMR Robot', color: '#38bdf8' },
                { label: 'Human Worker', color: '#f59e0b' },
                { label: 'Forklift', color: '#f43f5e' },
                { label: 'Barcode/QR', color: '#a78bfa' },
                { label: 'Conveyor', color: '#34d399' },
              ].map(({ label, color }) => (
                <span key={label} className="flex items-center gap-1 text-[9px] font-mono bg-neutral-900/60 border border-neutral-800 px-1.5 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-neutral-400">{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
