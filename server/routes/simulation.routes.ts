import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { CoordinationEngine } from '../services/coordination.service';
import { wsService } from '../services/websocket.service';

const router = Router();

/**
 * POST /api/v1/simulation/control & /api/v1/simulation/scenario - Control judge demonstration simulation scenarios
 */
router.post(['/control', '/scenario'], (req: Request, res: Response) => {
  try {
    const scenario = req.body.scenario || req.body.scenarioId; // 'rush-hour' | 'obstacle-injected' | 'robot-failure' | 'low-battery-dock' | 'reset'

    if (scenario === 'rush-hour') {
      // Create 5 instant rush tasks & allocate
      for (let i = 1; i <= 5; i++) {
        db.addTask({
          id: `task-rush-${Date.now()}-${i}`,
          taskCode: `TASK-RUSH-${i}`,
          title: `Rush Priority Cargo Transit #${i}`,
          pickupStationId: i % 2 === 0 ? 'st-p1' : 'st-p2',
          pickupStationName: i % 2 === 0 ? 'Inbound Dock Station 1' : 'Inbound Dock Station 2',
          dropoffStationId: i % 2 === 0 ? 'st-d1' : 'st-d2',
          dropoffStationName: i % 2 === 0 ? 'Packing Bay 1' : 'Packing Bay 2',
          priority: 'CRITICAL',
          status: 'PENDING',
          estimatedWeightKg: 400,
          createdTime: new Date().toISOString(),
          estimatedDurationSec: 180
        });
      }
      const assignments = CoordinationEngine.autoAllocatePendingTasks();
      wsService.broadcast('SIMULATION_EVENT', { scenario, message: `Rush hour triggered: 5 critical tasks generated & ${assignments.length} assigned.` });
      return res.json({ success: true, message: 'Rush hour scenario triggered successfully.', assignments });
    }

    if (scenario === 'obstacle-injected') {
      // Inject obstacle in Aisle A & trigger re-route
      const obs = db.addObstacle({
        id: `obs-sim-${Date.now()}`,
        code: `OBS-PALLET-SIM`,
        position: { x: 18, y: 14 },
        type: 'Pallet Debris',
        detectedByAmrId: 'amr-02',
        timestamp: new Date().toISOString()
      });

      // Update AMR-02 status to Blocked
      db.updateAmrTelemetry('amr-02', { status: 'Blocked' });

      // Re-allocate / Re-route
      db.addAlert({
        id: `alt-obs-${Date.now()}`,
        alertType: 'ROBOT_BLOCKED',
        severity: 'WARNING',
        amrId: 'amr-02',
        amrCode: 'AMR-02',
        message: 'Aisle A blocked by unexpected pallet debris. Dynamic A* path recalculation initiated.',
        timestamp: new Date().toISOString(),
        resolved: false
      });

      wsService.broadcast('SIMULATION_EVENT', { scenario, message: 'Aisle A obstacle injected! AMR-02 path blocked and re-routed.' });
      return res.json({ success: true, message: 'Obstacle scenario injected.', obstacle: obs });
    }

    if (scenario === 'robot-failure') {
      // Simulate failure on AMR-05
      const amr = db.updateAmrTelemetry('amr-05', { status: 'Emergency', speed: 0 });
      db.addAlert({
        id: `alt-fail-${Date.now()}`,
        alertType: 'HARDWARE_FAULT',
        severity: 'CRITICAL',
        amrId: 'amr-05',
        amrCode: 'AMR-05',
        message: 'EMERGENCY STOP: AMR-05 motor driver thermal fault detected. Mission automatically reassigned.',
        timestamp: new Date().toISOString(),
        resolved: false
      });

      wsService.broadcast('SIMULATION_EVENT', { scenario, message: 'AMR-05 motor fault simulated. Mission reassigned.' });
      return res.json({ success: true, message: 'Robot failure scenario triggered.', amr });
    }

    if (scenario === 'low-battery-dock') {
      // Force low battery on AMR-01
      const amr = db.updateAmrTelemetry('amr-01', {
        batteryLevel: 14,
        status: 'Charging',
        currentPosition: { x: 4, y: 38, zoneId: 'zone-5' }
      });
      db.addAlert({
        id: `alt-bat-${Date.now()}`,
        alertType: 'LOW_BATTERY',
        severity: 'WARNING',
        amrId: 'amr-01',
        amrCode: 'AMR-01',
        message: 'AMR-01 battery dropped below 15% threshold. Returning to Wireless Dock C1.',
        timestamp: new Date().toISOString(),
        resolved: false
      });

      wsService.broadcast('SIMULATION_EVENT', { scenario, message: 'AMR-01 battery low (14%). Docking to C1 initiated.' });
      return res.json({ success: true, message: 'Low battery dock scenario triggered.', amr });
    }

    if (scenario === 'reset') {
      db.resetDatabase();
      wsService.broadcast('SIMULATION_EVENT', { scenario, message: 'Warehouse digital twin simulation reset to factory state.' });
      return res.json({ success: true, message: 'Simulation reset successfully.' });
    }

    return res.status(400).json({
      success: false,
      error: { message: 'Invalid simulation scenario specified.' }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Simulation execution failed.' }
    });
  }
});

export default router;
