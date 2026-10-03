import { db } from '../db/database';
import { wsService } from './websocket.service';
import { ENV } from '../config/env';
import { CoordinationEngine } from './coordination.service';

export class TelemetryService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning: boolean = false;
  private static tickCounter: number = 0;

  public static start() {
    if (this.isRunning || !ENV.ENABLE_TELEMETRY_SIMULATION) return;

    this.isRunning = true;
    const intervalMs = 500;
    console.log(`[AMR Telemetry Simulation] Starting continuous indoor autonomous robot telemetry engine (interval: ${intervalMs}ms)`);

    this.timer = setInterval(() => {
      try {
        this.tick();
      } catch (err) {
        console.warn('[AMR Telemetry] Simulation tick error:', err);
      }
    }, intervalMs);
  }

  public static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[AMR Telemetry] Simulation engine paused.');
  }

  public static tick() {
    this.tickCounter++;

    // 1. Move Active AMRs along their planned routes or auto-assign patrol route
    const amrs = db.getAMRs();
    const stations = db.getStations();

    amrs.forEach((amr) => {
      if (amr.status === 'Emergency' || amr.status === 'Blocked') {
        // Robot is locked due to emergency or obstacle
        wsService.broadcast('AMR_TELEMETRY', amr);
        return;
      }

      if (amr.status === 'Charging') {
        // Recharge battery
        const updatedBattery = Math.min(100, amr.batteryLevel + 2.0);
        const updatedAmr = db.updateAmrTelemetry(amr.id, {
          batteryLevel: parseFloat(updatedBattery.toFixed(1)),
          speed: 0
        });
        if (updatedBattery >= 95) {
          db.updateAmrTelemetry(amr.id, { status: 'Idle' });
        }
        if (updatedAmr) {
          wsService.broadcast('AMR_TELEMETRY', updatedAmr);
        }
        return;
      }

      // If active and has route waypoints remaining
      if (amr.currentRoute && amr.currentRoute.length > 0) {
        const nextPos = amr.currentRoute[0];
        const updatedRoute = amr.currentRoute.slice(1);
        const updatedBattery = Math.max(10, amr.batteryLevel - 0.05);

        const updatedAmr = db.updateAmrTelemetry(amr.id, {
          currentPosition: nextPos,
          currentRoute: updatedRoute,
          batteryLevel: parseFloat(updatedBattery.toFixed(1)),
          speed: 1.2 + Math.random() * 0.5
        });

        if (updatedAmr) {
          wsService.broadcast('AMR_TELEMETRY', updatedAmr);
        }

        // If route completed
        if (updatedRoute.length === 0) {
          if (amr.currentTaskId) {
            db.updateTaskStatus(amr.currentTaskId, 'COMPLETED');
          }
          // Assign continuous patrol route to keep digital twin real-time & alive
          if (stations.length > 0) {
            const targetStat = stations[Math.floor(Math.random() * stations.length)];
            const patrolRoute = CoordinationEngine.planPath(nextPos, targetStat.position);
            db.updateAmrTelemetry(amr.id, {
              status: 'Active',
              currentTaskId: undefined,
              currentRoute: patrolRoute
            });
          }
        }
      } else {
        // If idle without route, auto-assign patrol route
        if (stations.length > 0) {
          const targetStat = stations[Math.floor(Math.random() * stations.length)];
          const patrolRoute = CoordinationEngine.planPath(amr.currentPosition, targetStat.position);
          db.updateAmrTelemetry(amr.id, {
            status: 'Active',
            currentRoute: patrolRoute
          });
        }
      }
    });

    // 2. Periodically run Task Allocation for pending tasks
    if (this.tickCounter % 2 === 0) {
      CoordinationEngine.autoAllocatePendingTasks();
      CoordinationEngine.detectRouteConflicts();
    }
  }
}

