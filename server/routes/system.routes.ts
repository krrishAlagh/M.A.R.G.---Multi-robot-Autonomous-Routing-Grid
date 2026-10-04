import { Router, Request, Response } from 'express';
import { wsService } from '../services/websocket.service';
import { db } from '../db/database';

const router = Router();
const startTime = Date.now();

// GET /api/health - Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();

  res.json({
    status: 'healthy',
    service: 'M.A.R.G. - Multi-robot Autonomous Routing Grid Backend',
    version: '2.6.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    activeWsClients: wsService.getConnectedClientsCount(),
    memoryUsageMB: {
      rss: Math.round(memory.rss / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
    },
    warehouseState: {
      amrsCount: db.getAMRs().length,
      zonesCount: db.getZones().length,
      stationsCount: db.getStations().length,
      tasksCount: db.getTasks().length,
      obstaclesCount: db.getObstacles().length
    }
  });
});

// GET /api/system/stats - Runtime statistics
router.get('/system/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      connectedWsClients: wsService.getConnectedClientsCount(),
      amrsActive: db.getAMRs().filter((a) => a.status === 'Active').length,
      amrsTotal: db.getAMRs().length,
      tasksPending: db.getTasks().filter((t) => t.status === 'PENDING').length,
      tasksCompleted: db.getTasks().filter((t) => t.status === 'COMPLETED').length,
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

export default router;
