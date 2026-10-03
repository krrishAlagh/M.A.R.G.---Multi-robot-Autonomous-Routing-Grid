import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { CoordinationEngine } from '../services/coordination.service';
import { wsService } from '../services/websocket.service';

const router = Router();

/**
 * POST /api/v1/coordination/assign - Run Multi-Robot Task Allocation Scoring Engine
 */
router.post('/assign', (req: Request, res: Response) => {
  try {
    const result = CoordinationEngine.autoAllocatePendingTasks();
    const conflicts = CoordinationEngine.detectRouteConflicts();

    if (result.length > 0) {
      wsService.broadcast('COORDINATION_UPDATE', { assignedCount: result.length, assignments: result });
    }

    return res.json({
      success: true,
      assignedCount: result.length,
      assignments: result,
      newConflictsDetected: conflicts.length
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Task allocation engine execution failed.' }
    });
  }
});

/**
 * GET /api/v1/coordination/conflicts - Live collision avoidance & route conflict log
 */
router.get('/conflicts', (req: Request, res: Response) => {
  try {
    const conflicts = db.getConflicts();
    return res.json({
      success: true,
      count: conflicts.length,
      data: conflicts
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to fetch conflicts.' }
    });
  }
});

/**
 * POST /api/v1/coordination/conflicts/:id/resolve - Mark route conflict as resolved
 */
router.post('/conflicts/:id/resolve', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const resolved = db.resolveConflict(id);
    if (!resolved) {
      return res.status(404).json({
        success: false,
        error: { message: `Conflict ${id} not found.` }
      });
    }
    return res.json({
      success: true,
      message: `Conflict ${id} resolved.`
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to resolve conflict.' }
    });
  }
});

export default router;
