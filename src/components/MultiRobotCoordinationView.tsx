import React from 'react';
import { RobotRouteConflict, Language } from '../types';
import { fetchRouteConflicts } from '../services/api';

interface MultiRobotCoordinationViewProps {
  language: Language;
  conflicts: RobotRouteConflict[];
  onRefresh?: () => void;
}

export const MultiRobotCoordinationView: React.FC<MultiRobotCoordinationViewProps> = ({
  language,
  conflicts,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-400 text-2xl">alt_route</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {language === 'hi' ? 'बहु-रोबोट समन्वय एवं टक्कर निवारण इंजन' : 'Multi-Robot Path Coordination & Collision Avoidance'}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Distributed A* path planning graph, deadlock detection, and real-time collision avoidance right-of-way rules.
          </p>
        </div>
      </div>

      {/* Path Planning & Conflict Architecture Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-xs font-mono font-bold text-blue-400 uppercase">1. Grid Path Engine</div>
          <h3 className="text-sm font-bold text-white">Distributed A* Navigation Graph</h3>
          <p className="text-xs text-slate-400">
            Calculates 8-directional shortest paths across 50x50 warehouse grid with dynamic cell weights.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase">2. Spatial Conflict Check</div>
          <h3 className="text-sm font-bold text-white">Same-Cell & Intersection Detector</h3>
          <p className="text-xs text-slate-400">
            Monitors overlapping waypoints and opposing directional deadlocks 4.0s in advance.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase">3. Autonomous Right-of-Way</div>
          <h3 className="text-sm font-bold text-white">Priority Yield & Hold Command</h3>
          <p className="text-xs text-slate-400">
            Issues micro-wait hold instructions or dynamic detour routes to lower-priority AMRs.
          </p>
        </div>
      </div>

      {/* Live Route Conflicts Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-400">warning</span>
          Live Route Conflict Warnings & Collision Avoidance Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Conflict ID</th>
                <th className="p-3">Involved AMRs</th>
                <th className="p-3">Conflict Position</th>
                <th className="p-3">Type & Severity</th>
                <th className="p-3">Automated Coordination Action</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {conflicts.map((cnf) => (
                <tr key={cnf.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-white">{cnf.id}</td>
                  <td className="p-3 font-mono text-blue-400 font-bold">
                    {cnf.amrCode1} ↔ {cnf.amrCode2}
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    X: {cnf.location.x}, Y: {cnf.location.y} ({cnf.location.aisle || 'Aisle'})
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold rounded">
                      {cnf.conflictType} • {cnf.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200 font-medium max-w-sm">{cnf.recommendedAction}</td>
                  <td className="p-3 font-mono">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        cnf.resolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}
                    >
                      {cnf.resolved ? 'RESOLVED' : 'ACTIVE WAIT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
