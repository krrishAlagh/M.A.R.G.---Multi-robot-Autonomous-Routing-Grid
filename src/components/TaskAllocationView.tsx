import React, { useState } from 'react';
import { WarehouseTask, WarehouseStation, Language } from '../types';
import { createWarehouseTask, runTaskAllocation } from '../services/api';

interface TaskAllocationViewProps {
  language: Language;
  tasks: WarehouseTask[];
  stations: WarehouseStation[];
  onRefresh?: () => void;
}

export const TaskAllocationView: React.FC<TaskAllocationViewProps> = ({
  language,
  tasks,
  stations,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickupId, setPickupId] = useState(stations.find((s) => s.type === 'Pickup')?.id || stations[0]?.id || '');
  const [dropoffId, setDropoffId] = useState(stations.find((s) => s.type === 'Dropoff')?.id || stations[1]?.id || '');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationMsg, setAllocationMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (!pickupId && stations.length > 0) {
      setPickupId(stations.find((s) => s.type === 'Pickup')?.id || stations[0]?.id || '');
    }
    if (!dropoffId && stations.length > 0) {
      setDropoffId(stations.find((s) => s.type === 'Dropoff')?.id || stations[1]?.id || stations[0]?.id || '');
    }
  }, [stations, pickupId, dropoffId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createWarehouseTask({
      title,
      pickupStationId: pickupId,
      dropoffStationId: dropoffId,
      priority,
      estimatedWeightKg: 280
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      setTitle('');
      if (onRefresh) onRefresh();
    }
  };

  const handleRunAllocation = async () => {
    setAllocationMsg('Executing Task Allocation Scoring Engine...');
    const res = await runTaskAllocation();
    if (res.success) {
      setAllocationMsg(`Successfully allocated ${res.assignedCount} pending tasks to optimal AMRs!`);
      if (onRefresh) onRefresh();
      setTimeout(() => setAllocationMsg(null), 3000);
    } else {
      setAllocationMsg(`Allocation error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Allocation Control */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-2xl">assignment</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {language === 'hi' ? 'कार्य आवंटन एवं स्कोरिंग इंजन' : 'Task Allocation & Transparent Scoring Mechanism'}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Explainable task assignment matching available AMRs based on distance, battery %, workload, priority, and aisle congestion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAllocation}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Run Allocation Scoring Engine
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Task
          </button>
        </div>
      </div>

      {allocationMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold rounded-xl">
          {allocationMsg}
        </div>
      )}

      {/* Task List Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-mono uppercase text-[10px]">
            <tr>
              <th className="p-3">Task Code</th>
              <th className="p-3">Mission Description</th>
              <th className="p-3">Pickup → Drop Station</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned AMR</th>
              <th className="p-3">Scoring Breakdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tasks.map((t) => {
              const priorityColor =
                t.priority === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : t.priority === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <tr key={t.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-white text-sm">{t.taskCode}</td>
                  <td className="p-3 text-slate-200 font-medium max-w-xs">{t.title}</td>
                  <td className="p-3 font-mono text-slate-400">
                    <span className="text-blue-400">{t.pickupStationName}</span> → <span className="text-emerald-400">{t.dropoffStationName}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${priorityColor}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'IN_TRANSIT'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    {t.assignedAmrCode ? (
                      <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-blue-300">
                        {t.assignedAmrCode}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-300">
                    {t.scoreBreakdown ? (
                      <div>
                        <span className="text-emerald-400 font-bold">{t.scoreBreakdown.totalScore} Total Score</span>
                        <div className="text-[10px] text-slate-400">
                          Dist: {t.scoreBreakdown.distanceScore} • Bat: {t.scoreBreakdown.batteryScore} • Work: {t.scoreBreakdown.workloadScore}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500">Pending calculation</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">add_task</span>
                Create Warehouse Transport Job
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title / Item Description:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Transport Pallet Lot A-42"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pickup Station:</label>
                <select
                  value={pickupId}
                  onChange={(e) => setPickupId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5"
                >
                  {stations.filter((s) => s.type === 'Pickup').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Drop-off Station:</label>
                <select
                  value={dropoffId}
                  onChange={(e) => setDropoffId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5"
                >
                  {stations.filter((s) => s.type === 'Dropoff').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority Level:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow"
                >
                  {isSubmitting ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
