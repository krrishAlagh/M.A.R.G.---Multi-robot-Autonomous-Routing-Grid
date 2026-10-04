import { useEffect, useState, useRef, useCallback } from 'react';
import {
  AMR,
  WarehouseZone,
  WarehouseStation,
  WarehouseTask,
  RobotRouteConflict,
  EdgePerceptionDetection,
  WarehouseObstacle,
  OperationalAlert,
  FleetMetrics
} from '../types';
import {
  fetchAMRs,
  fetchWarehouseMap,
  fetchTasks,
  fetchRouteConflicts,
  fetchEdgePerceptions,
  fetchAlerts,
  fetchMetrics
} from './api';

export interface RealtimeWarehouseState {
  isConnected: boolean;
  amrs: AMR[];
  zones: WarehouseZone[];
  stations: WarehouseStation[];
  tasks: WarehouseTask[];
  conflicts: RobotRouteConflict[];
  obstacles: WarehouseObstacle[];
  perceptions: EdgePerceptionDetection[];
  alerts: OperationalAlert[];
  metrics: FleetMetrics;
  latestEvent: { type: string; message: string; timestamp: string } | null;
  selectedAmrId: string | null;
}

export function useRealtimeData() {
  const [state, setState] = useState<RealtimeWarehouseState>({
    isConnected: false,
    amrs: [],
    zones: [],
    stations: [],
    tasks: [],
    conflicts: [],
    obstacles: [],
    perceptions: [],
    alerts: [],
    metrics: {
      totalAmrs: 6,
      activeAmrs: 3,
      idleAmrs: 1,
      chargingAmrs: 1,
      blockedAmrs: 1,
      taskCompletionRatePct: 98.4,
      avgTaskTimeSec: 215,
      warehouseThroughputPalletsHr: 142,
      collisionWarningsAvoidedCount: 18,
      activeConflictsCount: 1,
      avgWifiLatencyMs: 14.2,
      lastSyncTimestamp: new Date().toISOString()
    },
    latestEvent: null,
    selectedAmrId: null
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Play audio alert tone for collisions or emergency blocks
  const playAudioSiren = useCallback((severity: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = severity === 'CRITICAL' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(severity === 'CRITICAL' ? 784 : 523.25, audioCtx.currentTime); // G5 or C5
      osc.frequency.exponentialRampToValueAtTime(392, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio playback catch
    }
  }, []);

  const hydrateData = useCallback(async () => {
    const [amrList, mapData, taskList, conflictList, perceptionList, alertList, metricsData] = await Promise.all([
      fetchAMRs(),
      fetchWarehouseMap(),
      fetchTasks(),
      fetchRouteConflicts(),
      fetchEdgePerceptions(),
      fetchAlerts(),
      fetchMetrics()
    ]);

    setState((prev) => ({
      ...prev,
      amrs: amrList.length > 0 ? amrList : prev.amrs,
      zones: mapData?.zones || prev.zones,
      stations: mapData?.stations || prev.stations,
      obstacles: mapData?.obstacles || prev.obstacles,
      tasks: taskList.length > 0 ? taskList : prev.tasks,
      conflicts: conflictList,
      perceptions: perceptionList.length > 0 ? perceptionList : prev.perceptions,
      alerts: alertList.length > 0 ? alertList : prev.alerts,
      metrics: metricsData || prev.metrics
    }));
  }, []);

  useEffect(() => {
    hydrateData();

    // WebSocket Telemetry Connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const connectWS = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[MARG Realtime WS] Connected to AMR Fleet Telemetry Server.');
          setState((prev) => ({ ...prev, isConnected: true }));
        };

        ws.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data);

            if (payload.type === 'AMR_TELEMETRY' && payload.data) {
              const amr: AMR = payload.data;
              setState((prev) => {
                const idx = prev.amrs.findIndex((a) => a.id === amr.id);
                const updatedAmrs = [...prev.amrs];
                if (idx >= 0) updatedAmrs[idx] = amr;
                else updatedAmrs.push(amr);
                return { ...prev, amrs: updatedAmrs };
              });
            } else if (payload.type === 'TASK_UPDATE' && payload.data) {
              const task: WarehouseTask = payload.data;
              setState((prev) => {
                const idx = prev.tasks.findIndex((t) => t.id === task.id);
                const updatedTasks = [...prev.tasks];
                if (idx >= 0) updatedTasks[idx] = task;
                else updatedTasks.unshift(task);
                return { ...prev, tasks: updatedTasks };
              });
            } else if (payload.type === 'WAREHOUSE_OBSTACLE' && payload.data) {
              const obs: WarehouseObstacle = payload.data;
              playAudioSiren('WARNING');
              setState((prev) => ({
                ...prev,
                obstacles: [obs, ...prev.obstacles],
                latestEvent: {
                  type: 'OBSTACLE_DETECTED',
                  message: `New obstacle ${obs.code} (${obs.type}) injected at X:${obs.position.x}, Y:${obs.position.y}`,
                  timestamp: new Date().toLocaleTimeString()
                }
              }));
            } else if (payload.type === 'SIMULATION_EVENT' && payload.data) {
              playAudioSiren('CRITICAL');
              setState((prev) => ({
                ...prev,
                latestEvent: {
                  type: payload.data.scenario,
                  message: payload.data.message,
                  timestamp: new Date().toLocaleTimeString()
                }
              }));
              hydrateData();
            } else if (payload.type === 'ALERT_UPDATE' || payload.type === 'COORDINATION_UPDATE') {
              hydrateData();
            }
          } catch (err) {
            console.warn('[MARG WS] Parse error:', err);
          }
        };

        ws.onclose = () => {
          setState((prev) => ({ ...prev, isConnected: false }));
          setTimeout(connectWS, 2000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setState((prev) => ({ ...prev, isConnected: false }));
      }
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [hydrateData, playAudioSiren]);


  const selectAmr = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedAmrId: id }));
  };

  return {
    state,
    refreshData: hydrateData,
    selectAmr,
    playAudioSiren
  };
}
