import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { EdgePerceptionDetection } from '../types/serverTypes';
import { wsService } from '../services/websocket.service';

const router = Router();

/**
 * GET /api/v1/edge-ai/perceptions - List local edge vision perception detections
 */
router.get('/perceptions', (req: Request, res: Response) => {
  try {
    const amrId = req.query.amrId as string | undefined;
    const perceptions = db.getEdgePerceptions(amrId);

    return res.json({
      success: true,
      count: perceptions.length,
      data: perceptions
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to fetch edge perceptions.' }
    });
  }
});

/**
 * POST /api/v1/edge-ai/perceptions - Ingest a local edge AI perception detection log
 */
router.post('/perceptions', (req: Request, res: Response) => {
  try {
    const { amrId, objectClass, confidence, bbox, x, y, snapshotUrl } = req.body;

    if (!amrId || !objectClass) {
      return res.status(400).json({
        success: false,
        error: { message: 'amrId and objectClass are required.' }
      });
    }

    const amr = db.getAmrById(amrId);
    const amrCode = amr?.code || amrId;

    const detection: EdgePerceptionDetection = {
      id: `edg-${Date.now()}`,
      amrId,
      amrCode,
      objectClass: objectClass || 'Obstacle',
      confidence: confidence || 0.94,
      bbox: bbox || { x: 100, y: 50, w: 160, h: 120 },
      location: { x: x || amr?.currentPosition.x || 10, y: y || amr?.currentPosition.y || 10 },
      timestamp: new Date().toISOString(),
      snapshotUrl: snapshotUrl || 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop',
      isSimulated: true
    };

    const saved = db.addEdgePerception(detection);
    wsService.broadcast('EDGE_PERCEPTION', saved);

    return res.status(201).json({
      success: true,
      data: saved
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to ingest edge perception.' }
    });
  }
});

export default router;
