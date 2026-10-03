import React from 'react';
import { EdgePerceptionDetection, Language } from '../types';

interface EdgeAiPerceptionViewProps {
  language: Language;
  perceptions: EdgePerceptionDetection[];
}

export const EdgeAiPerceptionView: React.FC<EdgeAiPerceptionViewProps> = ({
  language,
  perceptions
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-2xl">visibility</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {language === 'hi' ? 'एज एआई विज़न एवं धारणा प्रणाली' : 'Edge-AI Robot Perception & Vision Intelligence'}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Local embedded TensorRT vision inference running onboard Jetson Orin Nano for sub-18ms obstacle extraction.
          </p>
        </div>
      </div>

      {/* Edge vs Central Intelligence Comparison Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edge Intelligence */}
        <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-base">memory</span>
              EDGE INTELLIGENCE (Onboard AMR)
            </h3>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded">
              Sub-18ms Latency
            </span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>YOLOv8-TensorRT local camera perception @ 30 FPS</li>
            <li>Immediate safety emergency stop on human operator detection</li>
            <li>Minimal raw-data transmission (only bounding boxes & coordinates)</li>
            <li>Local LiDAR obstacle feature extraction</li>
          </ul>
        </div>

        {/* Central Intelligence */}
        <div className="bg-slate-900/90 border border-blue-500/30 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-blue-400 font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-base">hub</span>
              CENTRAL INTELLIGENCE (Fleet HQ)
            </h3>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold rounded">
              Global Coordination
            </span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Multi-robot task allocation scoring mechanism</li>
            <li>A* global warehouse navigation graph path optimization</li>
            <li>Fleet-level collision warning & intersection yield rules</li>
            <li>Warehouse Digital Twin state synchronization</li>
          </ul>
        </div>
      </div>

      {/* Edge Vision Camera Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {perceptions.map((p) => (
          <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="relative h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img src={p.snapshotUrl} alt={p.objectClass} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

              {/* Bounding Box Overlay */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-emerald-400 bg-emerald-400/10 rounded flex items-start p-1">
                <span className="bg-emerald-500 text-black font-black text-[10px] px-1.5 py-0.5 rounded">
                  {p.objectClass} ({(p.confidence * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur text-white text-[10px] font-mono rounded">
                {p.amrCode} Camera
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{p.objectClass} Detected</span>
              <span className="text-slate-400">Position X:{p.location.x}, Y:{p.location.y}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
