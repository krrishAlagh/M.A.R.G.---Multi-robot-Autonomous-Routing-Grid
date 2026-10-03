import { Router } from 'express';
import { db } from '../db/database';

const router = Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: db.getAlerts() });
});

export default router;
