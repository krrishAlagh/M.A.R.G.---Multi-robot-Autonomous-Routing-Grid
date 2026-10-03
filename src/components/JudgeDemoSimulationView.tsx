import React, { useState } from 'react';
import { Language } from '../types';
import { runSimulationControl } from '../services/api';

interface JudgeDemoSimulationViewProps {
  language: Language;
  onRefresh?: () => void;
}

export const JudgeDemoSimulationView: React.FC<JudgeDemoSimulationViewProps> = ({
  language,
  onRefresh
}) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: 'INFO' | 'WARN' | 'SUCCESS'; msg: string }>>([
    { timestamp: '14:20:01.04', level: 'INFO', msg: 'Command Center connected to WebSockets Telemetry Mesh.' },
    { timestamp: '14:20:03.18', level: 'INFO', msg: 'A* Spatio-Temporal Reservation Grid synchronized.' }
  ]);

  const handleScenario = async (scenarioId: string, title: string) => {
    setActiveScenario(scenarioId);
    setStatusMsg(`Executing ${title}...`);
    
    const now = new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(Math.random() * 90 + 10);
    setLogs((prev) => [
      { timestamp: now, level: 'WARN', msg: `Triggering scenario: ${title}` },
      ...prev
    ]);

    const res = await runSimulationControl(scenarioId);
    if (res.success) {
      const succTime = new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(Math.random() * 90 + 10);
      setStatusMsg(`Scenario '${title}' executed successfully!`);
      setLogs((prev) => [
        { timestamp: succTime, level: 'SUCCESS', msg: res.message || `Scenario ${title} executed cleanly.` },
        ...prev
      ]);
      if (onRefresh) onRefresh();
    } else {
      setStatusMsg(`Scenario Error: ${res.error}`);
    }
  };

  const scenarios = [
    {
      id: 'rush-hour',
      title: 'Scenario 1: Warehouse Rush Hour',
      badge: 'HIGH WORKLOAD',
      color: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
      btnColor: 'bg-sky-500 hover:bg-sky-400 text-black',
      desc: 'Dispatches 5 high-priority pickup tasks simultaneously. Triggers multi-criteria scoring allocation engine across all available AMRs.',
      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'obstacle-injected',
      title: 'Scenario 2: Dynamic Aisle Obstacle',
      badge: 'DYNAMIC REROUTE',
      color: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      btnColor: 'bg-rose-500 hover:bg-rose-400 text-white',
      desc: 'Injects fallen pallet debris into Aisle A (X:18, Y:14). Forces instant sub-15ms A* re-routing for AMR-02.',
      img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'robot-failure',
      title: 'Scenario 3: AMR Motor Thermal Fault',
      badge: 'FAULT TOLERANCE',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-black',
      desc: 'Simulates drive motor thermal overload on AMR-05 (68°C). Automatically locks robot and transfers active mission to AMR-01.',
      img: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'low-battery-dock',
      title: 'Scenario 4: Auto Charging Docking',
      badge: 'AUTO RECHARGE',
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      btnColor: 'bg-purple-500 hover:bg-purple-400 text-white',
      desc: 'Forces AMR-01 battery level down to 14%. Robot suspends non-critical tasks and plans trajectory to Wireless Dock C1.',
      img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#121215] p-5 rounded-2xl border border-neutral-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[18px]">sports_esports</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">
              {language === 'hi' ? 'SIH26123 जज डेमो कंट्रोल रूम' : 'SIH26123 Hackathon Judge Simulation Control Room'}
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
              ● JUDGE DEMO MODE
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Deterministic control room suite designed for live evaluation of dynamic task allocation, A* re-routing, and fault recovery.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-xl animate-pulse">
          {statusMsg}
        </div>
      )}

      {/* Main Grid: Scenario Cards + Log Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario Launch Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="bg-[#121215] border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 group hover:border-neutral-700 transition-all"
            >
              <div className="space-y-2">
                <div className="relative h-32 rounded-xl overflow-hidden border border-neutral-800">
                  <img src={sc.img} alt={sc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/40" />
                  <span className={`absolute top-2 left-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${sc.color}`}>
                    {sc.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-100">{sc.title}</h3>
                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">{sc.desc}</p>
              </div>

              <button
                onClick={() => handleScenario(sc.id, sc.title)}
                className={`w-full py-2 rounded-xl text-xs font-bold font-mono transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${sc.btnColor}`}
              >
                <span>Trigger Scenario</span>
                <span className="material-symbols-outlined text-[14px]">play_arrow</span>
              </button>
            </div>
          ))}
        </div>

        {/* Real-time Command Room Event Log Terminal */}
        <div className="bg-[#0a0a0f] border border-neutral-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-emerald-400 text-base">terminal</span>
                <span>Live Event Terminal Log</span>
              </h3>
              <span className="text-[10px] font-mono text-neutral-500">QoS 1 MQTT</span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto no-scrollbar font-mono text-[11px]">
              {logs.map((l, i) => (
                <div key={i} className="p-2 rounded bg-neutral-900/60 border border-neutral-800/80 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">{l.timestamp}</span>
                    <span className={`font-bold ${
                      l.level === 'SUCCESS' ? 'text-emerald-400' : l.level === 'WARN' ? 'text-amber-400' : 'text-sky-400'
                    }`}>
                      [{l.level}]
                    </span>
                  </div>
                  <p className="text-neutral-300 leading-snug">{l.msg}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-mono text-neutral-400 text-center">
            A* Path Planner & Scoring Engine Ready
          </div>
        </div>

      </div>

    </div>
  );
};
