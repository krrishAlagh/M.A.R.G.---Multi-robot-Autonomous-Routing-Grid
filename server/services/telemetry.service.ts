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
    const intervalMs = Math.min(ENV.SIMULATION_INTERVAL_MS, 3000);
    console.log(`[AMR Telemetry Simulation] Starting indoor autonomous robot telemetry engine (interval: ${intervalMs}ms)`);

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

    // 1. Move Active AMRs along their planned routes
    const amrs = db.getAMRs();
    amrs.forEach((amr) => {
      if (amr.status === 'Active' && amr.currentRoute.length > 0) {
        // Step forward along route
        const nextPos = amr.currentRoute[0];
        const updatedRoute = amr.currentRoute.slice(1);

        // Slightly drain battery
        const updatedBattery = Math.max(5, amr.batteryLevel - 0.2);

        // Update Position & Speed
        const updatedAmr = db.updateAmrTelemetry(amr.id, {
          currentPosition: nextPos,
          currentRoute: updatedRoute,
          batteryLevel: parseFloat(updatedBattery.toFixed(1)),
          speed: 1.4 + Math.random() * 0.4
        });

        if (updatedAmr) {
          wsService.broadcast('AMR_TELEMETRY', updatedAmr);
        }

        // If route completed, update task to COMPLETED
        if (updatedRoute.length === 0 && amr.currentTaskId) {
          db.updateTaskStatus(amr.currentTaskId, 'COMPLETED');
          db.updateAmrTelemetry(amr.id, { status: 'Idle', speed: 0 });
        }
      } else if (amr.status === 'Charging') {
        // Recharge battery
        const updatedBattery = Math.min(100, amr.batteryLevel + 1.5);
        const updatedAmr = db.updateAmrTelemetry(amr.id, {
          batteryLevel: parseFloat(updatedBattery.toFixed(1))
        });
        if (updatedBattery >= 95) {
          db.updateAmrTelemetry(amr.id, { status: 'Idle' });
        }
        if (updatedAmr) {
          wsService.broadcast('AMR_TELEMETRY', updatedAmr);
        }
      }
    });

    // 2. Periodically run Task Allocation for pending tasks
    if (this.tickCounter % 3 === 0) {
      CoordinationEngine.autoAllocatePendingTasks();
      CoordinationEngine.detectRouteConflicts();
    }
  }
}
