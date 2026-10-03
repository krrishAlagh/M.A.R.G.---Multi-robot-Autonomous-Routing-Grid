import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { WarehouseObstacle } from '../types/serverTypes';
import { wsService } from '../services/websocket.service';

const router = Router();

/**
 * GET /api/v1/warehouse/map - Warehouse navigation graph, grid layout, zones, stations & obstacles
 */
router.get('/map', (req: Request, res: Response) => {
  try {
    const zones = db.getZones();
    const stations = db.getStations();
    const obstacles = db.getObstacles();

    return res.json({
      success: true,
      data: {
        gridSize: { width: 50, height: 50 },
        zones,
        stations,
        obstacles
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to fetch warehouse map.' }
    });
  }
});

/**
 * POST /api/v1/warehouse/obstacle - Inject an obstacle on the navigation grid
 */
router.post('/obstacle', (req: Request, res: Response) => {
  try {
    const { x, y, type, amrId } = req.body;
    if (x === undefined || y === undefined) {
      return res.status(400).json({
        success: false,
        error: { message: 'Grid coordinates x and y are required.' }
      });
    }

    const obstacle: WarehouseObstacle = {
      id: `obs-${Date.now()}`,
      code: `OBS-${Math.floor(100 + Math.random() * 900)}`,
      position: { x: parseInt(x, 10), y: parseInt(y, 10) },
      type: type || 'Pallet Debris',
      detectedByAmrId: amrId || 'amr-05',
      timestamp: new Date().toISOString()
    };

    const saved = db.addObstacle(obstacle);

    // Create Operational Alert
    db.addAlert({
      id: `alt-${Date.now()}`,
      alertType: 'ROBOT_BLOCKED',
      severity: 'WARNING',
      message: `New obstacle ${saved.code} (${saved.type}) detected at Grid Position X:${saved.position.x}, Y:${saved.position.y}. Dynamic path recalculation initiated.`,
      timestamp: new Date().toISOString(),
      resolved: false
    });

    wsService.broadcast('WAREHOUSE_OBSTACLE', saved);

    return res.status(201).json({
      success: true,
      message: `Obstacle injected at X:${saved.position.x}, Y:${saved.position.y}`,
      data: saved
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to inject obstacle.' }
    });
  }
});

/**
 * DELETE /api/v1/warehouse/obstacle/:id - Clear an obstacle from grid
 */
router.delete('/obstacle/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const removed = db.removeObstacle(id);
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: { message: `Obstacle ${id} not found.` }
      });
    }
    return res.json({
      success: true,
      message: `Obstacle ${id} cleared from navigation grid.`
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to remove obstacle.' }
    });
  }
});

export default router;
