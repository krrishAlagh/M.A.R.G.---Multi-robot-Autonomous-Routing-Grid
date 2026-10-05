import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { WarehouseTask } from '../types/serverTypes';
import { wsService } from '../services/websocket.service';
import { CoordinationEngine } from '../services/coordination.service';

const router = Router();

/**
 * GET /api/v1/tasks - List pickup/drop-off tasks
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const amrId = req.query.amrId as string | undefined;

    const tasks = db.getTasks({ status, priority, amrId });
    return res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to fetch tasks.' }
    });
  }
});

/**
 * POST /api/v1/tasks - Create a new pickup/drop-off task
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, pickupStationId, dropoffStationId, priority, estimatedWeightKg } = req.body;

    if (!pickupStationId || !dropoffStationId) {
      return res.status(400).json({
        success: false,
        error: { message: 'pickupStationId and dropoffStationId are required.' }
      });
    }

    const stations = db.getStations();
    const pStat = stations.find((s) => s.id === pickupStationId) || stations[0];
    const dStat = stations.find((s) => s.id === dropoffStationId) || stations[1];

    const newTask: WarehouseTask = {
      id: `task-${Date.now()}`,
      taskCode: `TASK-PK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || `Transport pallet from ${pStat.name} to ${dStat.name}`,
      pickupStationId: pStat.id,
      pickupStationName: pStat.name,
      dropoffStationId: dStat.id,
      dropoffStationName: dStat.name,
      priority: priority || 'HIGH',
      status: 'PENDING',
      estimatedWeightKg: estimatedWeightKg || 250,
      createdTime: new Date().toISOString(),
      estimatedDurationSec: 200
    };

    const saved = db.addTask(newTask);
    wsService.broadcast('TASK_UPDATE', saved);

    return res.status(201).json({
      success: true,
      message: `Task ${saved.taskCode} created successfully.`,
      data: saved
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to create task.' }
    });
  }
});

/**
 * PUT /api/v1/tasks/:id/status - Update task status
 */
router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status, assignedAmrId } = req.body;

    const updated = db.updateTaskStatus(id, status, assignedAmrId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { message: `Task ${id} not found.` }
      });
    }

    wsService.broadcast('TASK_UPDATE', updated);

    return res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to update task.' }
    });
  }
});

/**
 * POST /api/v1/tasks/allocate - Execute multi-criteria task allocation scoring
 */
router.post('/allocate', (req: Request, res: Response) => {
  try {
    const { taskId } = req.body;
    const assignments = CoordinationEngine.autoAllocatePendingTasks();
    const conflicts = CoordinationEngine.detectRouteConflicts();

    if (assignments.length > 0) {
      wsService.broadcast('COORDINATION_UPDATE', { assignedCount: assignments.length, assignments });
    }

    const matched = taskId
      ? assignments.find((a) => a.task.id === taskId || a.task.taskCode === taskId)
      : assignments[0];

    return res.json({
      success: true,
      taskId: matched ? matched.task.taskCode : (taskId || 'ALL'),
      assignedAmr: matched ? matched.assignedAmr.code : (assignments[0]?.assignedAmr.code || null),
      allocationScore: matched ? matched.score.totalScore : (assignments[0]?.score.totalScore || 0),
      estimatedETA: '42s',
      assignedCount: assignments.length,
      assignments,
      newConflictsDetected: conflicts.length
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Task allocation failed.' }
    });
  }
});

export default router;
