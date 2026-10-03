import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { wsService } from '../services/websocket.service';

const router = Router();

/**
 * GET /api/v1/amrs - List all AMRs & telemetry
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const amrs = db.getAMRs();
    return res.json({
      success: true,
      count: amrs.length,
      data: amrs
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to fetch AMR fleet.' }
    });
  }
});

/**
 * GET /api/v1/amrs/:id - Single AMR details
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const amr = db.getAmrById(id);
    if (!amr) {
      return res.status(404).json({
        success: false,
        error: { message: `AMR with id/code ${id} not found.` }
      });
    }
    return res.json({
      success: true,
      data: amr
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to fetch AMR details.' }
    });
  }
});

/**
 * POST /api/v1/amrs/:id/command - Send direct manual command to an AMR
 */
router.post('/:id/command', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { command } = req.body; // 'emergency-stop' | 'return-to-dock' | 'resume'

    const amr = db.getAmrById(id);
    if (!amr) {
      return res.status(404).json({
        success: false,
        error: { message: `AMR ${id} not found.` }
      });
    }

    if (command === 'emergency-stop') {
      amr.status = 'Emergency';
      amr.speed = 0;
    } else if (command === 'return-to-dock') {
      amr.status = 'Charging';
      amr.currentPosition = { x: 4, y: 38, zoneId: 'zone-5' };
      amr.speed = 0;
    } else if (command === 'resume') {
      amr.status = 'Idle';
    }

    db.save();

    // Broadcast WebSocket update
    wsService.broadcast('AMR_TELEMETRY', amr);

    return res.json({
      success: true,
      message: `Command '${command}' executed on ${amr.code}.`,
      data: amr
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to execute AMR command.' }
    });
  }
});

export default router;
