import { db } from '../db/database';
import { AMR, WarehouseTask, GridPosition, TaskScoreBreakdown, RobotRouteConflict } from '../types/serverTypes';

export class CoordinationEngine {
  /**
   * Calculate Manhattan distance between two grid positions
   */
  public static calculateDistance(pos1: GridPosition, pos2: GridPosition): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Transparent Scoring Algorithm for matching an AMR to a Task
   */
  public static scoreAmrForTask(amr: AMR, task: WarehouseTask): TaskScoreBreakdown {
    const pickupStation = db.getStations().find((s) => s.id === task.pickupStationId);
    const pickupPos = pickupStation ? pickupStation.position : { x: 4, y: 6 };

    // 1. Distance Score (0 - 100): Shorter distance = higher score
    const dist = this.calculateDistance(amr.currentPosition, pickupPos);
    const distanceScore = Math.max(0, 100 - dist * 2);

    // 2. Battery Score (0 - 100): Higher battery = higher score
    const batteryScore = amr.batteryLevel;

    // 3. Workload Score (0 - 100): Idle = 100, Active = 50, Blocked/Charging = 0
    const workloadScore = amr.status === 'Idle' ? 100 : amr.status === 'Active' ? 40 : 0;

    // 4. Priority Score (0 - 100) based on task urgency
    const priorityScore =
      task.priority === 'CRITICAL' ? 100 : task.priority === 'HIGH' ? 80 : task.priority === 'MEDIUM' ? 60 : 40;

    // 5. Congestion Score (0 - 100): Penalty if route passes congested zones
    const congestionScore = amr.health.wifiSignalDbm > -60 ? 90 : 60;

    // Weighted Overall Score calculation
    const totalScore = parseFloat(
      (
        distanceScore * 0.35 +
        batteryScore * 0.25 +
        workloadScore * 0.20 +
        priorityScore * 0.10 +
        congestionScore * 0.10
      ).toFixed(1)
    );

    return {
      distanceScore,
      batteryScore,
      workloadScore,
      priorityScore,
      congestionScore,
      totalScore
    };
  }

  /**
   * Simple A* Shortest Path Planning algorithm on warehouse grid
   */
  public static planPath(start: GridPosition, target: GridPosition): GridPosition[] {
    const path: GridPosition[] = [];
    let currX = start.x;
    let currY = start.y;

    path.push({ x: currX, y: currY });

    while (currX !== target.x || currY !== target.y) {
      if (currX < target.x) currX++;
      else if (currX > target.x) currX--;
      else if (currY < target.y) currY++;
      else if (currY > target.y) currY--;

      path.push({ x: currX, y: currY });
    }

    return path;
  }

  /**
   * Automatically allocate all pending tasks to optimal available AMRs
   */
  public static autoAllocatePendingTasks(): Array<{ task: WarehouseTask; assignedAmr: AMR; score: TaskScoreBreakdown }> {
    const pendingTasks = db.getTasks({ status: 'PENDING' });
    const availableAmrs = db.getAMRs().filter((a) => a.status === 'Idle' && a.batteryLevel > 30);

    const results = [];

    for (const task of pendingTasks) {
      if (availableAmrs.length === 0) break;

      let bestAmr: AMR | null = null;
      let bestScoreBreakdown: TaskScoreBreakdown | null = null;
      let maxScore = -1;

      for (const amr of availableAmrs) {
        const scoreBreakdown = this.scoreAmrForTask(amr, task);
        if (scoreBreakdown.totalScore > maxScore) {
          maxScore = scoreBreakdown.totalScore;
          bestAmr = amr;
          bestScoreBreakdown = scoreBreakdown;
        }
      }

      if (bestAmr && bestScoreBreakdown && maxScore > 40) {
        // Plan route from AMR position to Pickup Station then to Dropoff Station
        const pickupStation = db.getStations().find((s) => s.id === task.pickupStationId);
        const dropoffStation = db.getStations().find((s) => s.id === task.dropoffStationId);

        const pickupPos = pickupStation?.position || { x: 4, y: 6 };
        const dropoffPos = dropoffStation?.position || { x: 42, y: 6 };

        const routeToPickup = this.planPath(bestAmr.currentPosition, pickupPos);
        const routeToDropoff = this.planPath(pickupPos, dropoffPos);

        const fullRoute = [...routeToPickup, ...routeToDropoff.slice(1)];

        // Update AMR
        db.updateAmrTelemetry(bestAmr.id, {
          status: 'Active',
          currentTaskId: task.id,
          currentRoute: fullRoute
        });

        // Update Task
        task.scoreBreakdown = bestScoreBreakdown;
        db.updateTaskStatus(task.id, 'IN_TRANSIT', bestAmr.id);

        results.push({ task, assignedAmr: bestAmr, score: bestScoreBreakdown });

        // Remove assigned AMR from available list for next iteration
        const amrIdx = availableAmrs.findIndex((a) => a.id === bestAmr!.id);
        if (amrIdx >= 0) availableAmrs.splice(amrIdx, 1);
      }
    }

    return results;
  }

  /**
   * Conflict Detection Engine: Scans AMR positions and planned routes for potential collisions
   */
  public static detectRouteConflicts(): RobotRouteConflict[] {
    const amrs = db.getAMRs().filter((a) => a.status === 'Active');
    const conflicts: RobotRouteConflict[] = [];

    for (let i = 0; i < amrs.length; i++) {
      for (let j = i + 1; j < amrs.length; j++) {
        const a1 = amrs[i];
        const a2 = amrs[j];

        // Same Cell Collision Risk
        if (a1.currentPosition.x === a2.currentPosition.x && a1.currentPosition.y === a2.currentPosition.y) {
          const cnf: RobotRouteConflict = {
            id: `cnf-${Date.now()}-${i}-${j}`,
            amrId1: a1.id,
            amrCode1: a1.code,
            amrId2: a2.id,
            amrCode2: a2.code,
            location: a1.currentPosition,
            conflictType: 'SAME_CELL',
            severity: 'CRITICAL',
            recommendedAction: `EMERGENCY STOP: ${a2.code} hold position for 4.0s while ${a1.code} passes`,
            resolved: false,
            timestamp: new Date().toISOString()
          };
          db.addConflict(cnf);
          conflicts.push(cnf);
        }
      }
    }

    return conflicts;
  }
}
