import React, { useState } from 'react';
import { OperationalAlert, Language } from '../types';
import { resolveAlert } from '../services/api';

interface NotificationsViewProps {
  language: Language;
  alerts?: OperationalAlert[];
  onSelectAlert?: (alert: OperationalAlert) => void;
  onRefresh?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  language,
  alerts = [],
  onRefresh
}) => {
  const defaultAlerts: OperationalAlert[] = [
    {
      id: 'ALT-101',
      amrId: 'AMR-004',
      alertType: 'COLLISION_WARNING',
      severity: 'CRITICAL',
      message: 'Sub-18ms Edge perception triggered emergency stop: Human worker in Aisle B2',
      timestamp: new Date().toISOString(),
      resolved: false,
      recommendedAction: 'Verify safety zone clear and dispatch floor supervisor'
    },
    {
      id: 'ALT-102',
      amrId: 'AMR-002',
      alertType: 'LOW_BATTERY',
      severity: 'WARNING',
      message: 'AMR-002 battery dropped to 14%. Task allocation score penalized by 45%',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      resolved: false,
      recommendedAction: 'Autonomous return to Charging Pad CHG-01 scheduled'
    },
    {
      id: 'ALT-103',
      amrId: 'AMR-005',
      alertType: 'ROBOT_BLOCKED',
      severity: 'WARNING',
      message: 'Unmapped static box stack detected at (30, 25). Global A* route recalculated.',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      resolved: true,
      recommendedAction: 'A* detour approved dynamically via Central HQ'
    }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;
  const [filter, setFilter] = useState<'all' | 'critical' | 'unresolved'>('all');

  const handleResolveAlert = async (id: string) => {
    const res = await resolveAlert(id);
    if (res.success && onRefresh) {
      onRefresh();
    }
  };

  const filtered = displayAlerts.filter((a) => {
    if (filter === 'critical') return a.severity === 'CRITICAL';
    if (filter === 'unresolved') return !a.resolved;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {language === 'hi' ? 'ऑपरेशनल अलर्ट एवं सुरक्षा फीड' : 'Operational Safety & AMR Alerts'}
            </h1>
            <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-mono">
              Real-time Sub-18ms Edge
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Central HQ stream of obstacle detections, e-stop interlocks, battery thresholds, and dynamic path reroutes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-full border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                filter === 'all' ? 'bg-cyan-500 text-white font-semibold shadow-xs' : 'text-slate-400'
              }`}
            >
              All ({displayAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                filter === 'critical' ? 'bg-rose-500 text-white font-semibold shadow-xs' : 'text-slate-400'
              }`}
            >
              Critical ({displayAlerts.filter((a) => a.severity === 'CRITICAL').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unresolved')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                filter === 'unresolved' ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs' : 'text-slate-400'
              }`}
            >
              Unresolved ({displayAlerts.filter((a) => !a.resolved).length})
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3.5 max-w-4xl mx-auto w-full">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`bg-slate-900 border rounded-2xl p-5 flex items-start gap-4 transition-all shadow-lg ${
              alert.severity === 'CRITICAL'
                ? 'border-rose-500/50 bg-rose-950/10'
                : 'border-slate-800'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                alert.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {alert.severity === 'CRITICAL' ? 'warning' : 'info'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 font-semibold">{alert.amrId || 'HQ'}</span>
                  <span className="text-xs font-semibold text-white">{alert.alertType}</span>
                  {!alert.resolved ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      RESOLVED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono rounded cursor-pointer transition-all"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{alert.message}</p>
              {alert.recommendedAction && (
                <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-cyan-400">shield</span>
                  <span><strong>Action:</strong> {alert.recommendedAction}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

