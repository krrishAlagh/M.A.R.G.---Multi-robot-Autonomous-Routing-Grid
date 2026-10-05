import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';
import {
  AMR,
  WarehouseZone,
  WarehouseStation,
  WarehouseTask,
  RobotRouteConflict,
  EdgePerceptionDetection,
  WarehouseObstacle,
  OperationalAlert,
  FleetMetrics,
  UserAccount,
  GridPosition
} from '../types/serverTypes';
import {
  INITIAL_USERS,
  INITIAL_AMRS,
  INITIAL_ZONES,
  INITIAL_STATIONS,
  INITIAL_TASKS,
  INITIAL_CONFLICTS,
  INITIAL_OBSTACLES,
  INITIAL_EDGE_PERCEPTIONS,
  INITIAL_ALERTS,
  INITIAL_METRICS
} from './seed';

export interface DatabaseSchema {
  users: UserAccount[];
  amrs: AMR[];
  zones: WarehouseZone[];
  stations: WarehouseStation[];
  tasks: WarehouseTask[];
  conflicts: RobotRouteConflict[];
  obstacles: WarehouseObstacle[];
  perceptions: EdgePerceptionDetection[];
  alerts: OperationalAlert[];
  metrics: FleetMetrics;
}

class HighPerformanceDatabase {
  private data: DatabaseSchema;
  private dbFilePath: string;
  private isPersisting: boolean = false;
  private pendingPersist: boolean = false;

  constructor() {
    this.dbFilePath = path.join(ENV.DATA_DIR, 'db.json');
    this.data = this.initializeDatabase();
  }

  private initializeDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(ENV.DATA_DIR)) {
        fs.mkdirSync(ENV.DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.amrs && parsed.zones && parsed.tasks) {
          console.log('[DB] Loaded existing SIH26123 persistent AMR warehouse state from disk.');
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[DB] Failed to load disk state, initializing SIH26123 seed datasets:', err);
    }

    console.log('[DB] Initializing new database with M.A.R.G. - Multi-robot Autonomous Routing Grid seed datasets.');
    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      amrs: INITIAL_AMRS,
      zones: INITIAL_ZONES,
      stations: INITIAL_STATIONS,
      tasks: INITIAL_TASKS,
      conflicts: INITIAL_CONFLICTS,
      obstacles: INITIAL_OBSTACLES,
      perceptions: INITIAL_EDGE_PERCEPTIONS,
      alerts: INITIAL_ALERTS,
      metrics: INITIAL_METRICS
    };

    this.persistSync(initial);
    return initial;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(ENV.DATA_DIR)) {
        fs.mkdirSync(ENV.DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error writing sync to db.json:', err);
    }
  }

  public save(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isPersisting) {
        this.pendingPersist = true;
        resolve();
        return;
      }

      this.isPersisting = true;
      const snapshot = JSON.stringify(this.data, null, 2);

      fs.writeFile(this.dbFilePath, snapshot, 'utf-8', (err) => {
        this.isPersisting = false;
        if (err) {
          console.error('[DB] Async persistence error:', err);
        }
        if (this.pendingPersist) {
          this.pendingPersist = false;
          this.save().then(resolve);
        } else {
          resolve();
        }
      });
    });
  }

  // --- Users ---
  public getUsers(): UserAccount[] {
    return [...this.data.users];
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  // --- AMRs ---
  public getAMRs(): AMR[] {
    return [...this.data.amrs];
  }

  public getAmrById(idOrCode: string): AMR | undefined {
    const norm = idOrCode.trim().toUpperCase();
    return this.data.amrs.find((a) => a.id.toUpperCase() === norm || a.code.toUpperCase() === norm);
  }

  public updateAmrTelemetry(
    amrId: string,
    updates: Partial<AMR>
  ): AMR | undefined {
    const amr = this.getAmrById(amrId);
    if (amr) {
      Object.assign(amr, updates);
      this.save();
      return amr;
    }
    return undefined;
  }

  // --- Warehouse Map, Zones & Stations ---
  public getZones(): WarehouseZone[] {
    return [...this.data.zones];
  }

  public getStations(): WarehouseStation[] {
    return [...this.data.stations];
  }

  public getObstacles(): WarehouseObstacle[] {
    return [...this.data.obstacles];
  }

  public addObstacle(obstacle: WarehouseObstacle): WarehouseObstacle {
    this.data.obstacles.push(obstacle);
    this.save();
    return obstacle;
  }

  public removeObstacle(obstacleId: string): boolean {
    const idx = this.data.obstacles.findIndex((o) => o.id === obstacleId);
    if (idx >= 0) {
      this.data.obstacles.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Warehouse Tasks & Scoring ---
  public getTasks(filters?: { status?: string; priority?: string; amrId?: string }): WarehouseTask[] {
    let result = [...this.data.tasks];
    if (filters) {
      if (filters.status) result = result.filter((t) => t.status === filters.status);
      if (filters.priority) result = result.filter((t) => t.priority === filters.priority);
      if (filters.amrId) result = result.filter((t) => t.assignedAmrId === filters.amrId);
    }
    return result.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
  }

  public addTask(task: WarehouseTask): WarehouseTask {
    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  public updateTaskStatus(taskId: string, status: WarehouseTask['status'], assignedAmrId?: string): WarehouseTask | undefined {
    const task = this.data.tasks.find((t) => t.id === taskId || t.taskCode === taskId);
    if (task) {
      task.status = status;
      if (assignedAmrId) {
        task.assignedAmrId = assignedAmrId;
        const amr = this.getAmrById(assignedAmrId);
        if (amr) {
          task.assignedAmrCode = amr.code;
          amr.currentTaskId = task.id;
          amr.status = 'Active';
        }
      }
      if (status === 'COMPLETED') {
        task.completedTime = new Date().toISOString();
        if (task.assignedAmrId) {
          const amr = this.getAmrById(task.assignedAmrId);
          if (amr) {
            amr.currentTaskId = undefined;
            amr.status = 'Idle';
          }
        }
      }
      this.save();
      return task;
    }
    return undefined;
  }

  // --- Multi-Robot Coordination & Conflicts ---
  public getConflicts(): RobotRouteConflict[] {
    return [...this.data.conflicts];
  }

  public addConflict(conflict: RobotRouteConflict): RobotRouteConflict {
    this.data.conflicts.unshift(conflict);
    this.save();
    return conflict;
  }

  public resolveConflict(conflictId: string): boolean {
    const cnf = this.data.conflicts.find((c) => c.id === conflictId);
    if (cnf) {
      cnf.resolved = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- Edge Perception Detections ---
  public getEdgePerceptions(amrId?: string): EdgePerceptionDetection[] {
    let result = [...this.data.perceptions];
    if (amrId) {
      result = result.filter((p) => p.amrId === amrId || p.amrCode === amrId);
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addEdgePerception(detection: EdgePerceptionDetection): EdgePerceptionDetection {
    this.data.perceptions.unshift(detection);
    if (this.data.perceptions.length > 100) {
      this.data.perceptions = this.data.perceptions.slice(0, 100);
    }
    this.save();
    return detection;
  }

  // --- Operational Alerts ---
  public getAlerts(): OperationalAlert[] {
    return [...this.data.alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAlert(alert: OperationalAlert): OperationalAlert {
    this.data.alerts.unshift(alert);
    this.save();
    return alert;
  }

  public resolveAlert(alertId: string): boolean {
    const alt = this.data.alerts.find((a) => a.id === alertId);
    if (alt) {
      alt.resolved = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- Fleet Metrics ---
  public getMetrics(): FleetMetrics {
    const amrs = this.getAMRs();
    return {
      ...this.data.metrics,
      totalAmrs: amrs.length,
      activeAmrs: amrs.filter((a) => a.status === 'Active').length,
      idleAmrs: amrs.filter((a) => a.status === 'Idle').length,
      chargingAmrs: amrs.filter((a) => a.status === 'Charging').length,
      blockedAmrs: amrs.filter((a) => a.status === 'Blocked' || a.status === 'Emergency').length,
      activeConflictsCount: this.data.conflicts.filter((c) => !c.resolved).length,
      lastSyncTimestamp: new Date().toISOString()
    };
  }

  public resetDatabase(): void {
    this.data = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      amrs: JSON.parse(JSON.stringify(INITIAL_AMRS)),
      zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
      stations: JSON.parse(JSON.stringify(INITIAL_STATIONS)),
      tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
      conflicts: JSON.parse(JSON.stringify(INITIAL_CONFLICTS)),
      obstacles: JSON.parse(JSON.stringify(INITIAL_OBSTACLES)),
      perceptions: JSON.parse(JSON.stringify(INITIAL_EDGE_PERCEPTIONS)),
      alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
      metrics: JSON.parse(JSON.stringify(INITIAL_METRICS))
    };
    this.save();
  }
}

export const db = new HighPerformanceDatabase();
