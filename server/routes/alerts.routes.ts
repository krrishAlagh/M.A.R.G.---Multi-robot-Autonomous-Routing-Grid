import { Router } from 'express';
import { db } from '../db/database';
import { wsService } from '../services/websocket.service';

const router = Router();

/**
 * GET /api/v1/alerts - Fetch operational safety alerts
 */
router.get('/', (req, res) => {
  res.json({ success: true, data: db.getAlerts() });
});

/**
 * POST /api/v1/alerts/:id/resolve - Resolve operational alert
 */
router.post('/:id/resolve', (req, res) => {
  try {
    const id = req.params.id;
    const resolved = db.resolveAlert(id);
    if (!resolved) {
      return res.status(404).json({ success: false, error: { message: `Alert ${id} not found.` } });
    }
    wsService.broadcast('ALERT_UPDATE', { id, resolved: true });
    return res.json({ success: true, message: `Alert ${id} resolved.` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message || 'Failed to resolve alert.' } });
  }
});

export default router;

