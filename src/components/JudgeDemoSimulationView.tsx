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

  const handleScenario = async (scenario: string) => {
    setActiveScenario(scenario);
    setStatusMsg(`Triggering scenario: ${scenario}...`);
    const res = await runSimulationControl(scenario);
    if (res.success) {
      setStatusMsg(`Scenario '${scenario}' executed successfully! ${res.message || ''}`);
      if (onRefresh) onRefresh();
    } else {
      setStatusMsg(`Scenario Error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">sports_esports</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {language === 'hi' ? 'SIH26123 जज सिमुलेशन एवं डेमो कंट्रोलर' : 'SIH26123 Hackathon Judge Demonstration Controller'}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic demonstration controller to showcase real-time task allocation, dynamic re-routing, obstacle injection, and robot failure recovery.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold rounded-2xl animate-pulse">
          {statusMsg}
        </div>
      )}

      {/* Demo Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scenario 1: Warehouse Rush */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">bolt</span>
              Scenario 1: Warehouse Rush Hour
            </h3>
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold rounded">
              High Workload
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Generates 5 critical pickup/drop-off tasks simultaneously and executes the Task Allocation Scoring Engine to assign them to available AMRs.
          </p>
          <button
            onClick={() => handleScenario('rush-hour')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
          >
            Trigger Rush Hour Scenario
          </button>
        </div>

        {/* Scenario 2: Obstacle Injection */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400">block</span>
              Scenario 2: Unexpected Aisle Obstacle
            </h3>
            <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold rounded">
              Dynamic Re-Routing
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Injects pallet debris into Aisle A (X:18, Y:14), blocking AMR-02. Triggers dynamic A* path recalculation and obstacle alert.
          </p>
          <button
            onClick={() => handleScenario('obstacle-injected')}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
          >
            Inject Aisle Obstacle & Re-Route
          </button>
        </div>

        {/* Scenario 3: Robot Motor Thermal Failure */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">report_problem</span>
              Scenario 3: Robot Hardware Failure & Task Handover
            </h3>
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold rounded">
              Fault Tolerance
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Simulates emergency motor thermal fault on AMR-05. Automatically stops the robot and re-assigns its active task to an idle robot.
          </p>
          <button
            onClick={() => handleScenario('robot-failure')}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
          >
            Simulate AMR-05 Motor Fault
          </button>
        </div>

        {/* Scenario 4: Low Battery Auto-Docking */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">battery_alert</span>
              Scenario 4: Low Battery Autonomous Docking
            </h3>
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold rounded">
              Auto Charging
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Forces AMR-01 battery level down to 14%. Robot autonomously suspends non-critical tasks and plans path to Wireless Dock C1.
          </p>
          <button
            onClick={() => handleScenario('low-battery-dock')}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
          >
            Trigger AMR-01 Low Battery Docking
          </button>
        </div>
      </div>
    </div>
  );
};
