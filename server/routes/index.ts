import { Router } from 'express';
import authRoutes from './auth.routes';
import amrRoutes from './amr.routes';
import warehouseRoutes from './warehouse.routes';
import tasksRoutes from './tasks.routes';
import coordinationRoutes from './coordination.routes';
import edgeAiRoutes from './edgeAi.routes';
import simulationRoutes from './simulation.routes';
import alertsRoutes from './alerts.routes';
import analyticsRoutes from './analytics.routes';
import systemRoutes from './system.routes';

const masterRouter = Router();

// Version 1 Routes (/api/v1/...)
const v1Router = Router();
v1Router.use('/amrs', amrRoutes);
v1Router.use('/warehouse', warehouseRoutes);
v1Router.use('/map', warehouseRoutes);
v1Router.use('/tasks', tasksRoutes);
v1Router.use('/coordination', coordinationRoutes);
v1Router.use('/edge-ai', edgeAiRoutes);
v1Router.use('/simulation', simulationRoutes);
v1Router.use('/alerts', alertsRoutes);
v1Router.use('/analytics', analyticsRoutes);

masterRouter.use('/v1', v1Router);

// Standard API Routes (/api/...)
masterRouter.use('/auth', authRoutes);
masterRouter.use('/amrs', amrRoutes);
masterRouter.use('/warehouse', warehouseRoutes);
masterRouter.use('/map', warehouseRoutes);
masterRouter.use('/tasks', tasksRoutes);
masterRouter.use('/coordination', coordinationRoutes);
masterRouter.use('/edge-ai', edgeAiRoutes);
masterRouter.use('/simulation', simulationRoutes);
masterRouter.use('/alerts', alertsRoutes);
masterRouter.use('/analytics', analyticsRoutes);
masterRouter.use('/', systemRoutes);

export default masterRouter;

