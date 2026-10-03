import { Router } from 'express';
import { db } from '../db/database';

const router = Router();

router.get('/overview', (req, res) => {
  res.json({ success: true, data: db.getMetrics() });
});

export default router;
