import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { UserRole } from '../types/serverTypes';

const router = Router();

// GET /api/auth/roles - List available user roles
router.get('/roles', (req: Request, res: Response) => {
  const roles: UserRole[] = [
    'Warehouse Operations Director',
    'Fleet Systems Engineer',
    'Safety & Edge AI Specialist',
    'Warehouse Floor Supervisor'
  ];
  res.json({ success: true, data: roles });
});

// GET /api/auth/users - List users
router.get('/users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ success: true, data: users });
});

// POST /api/auth/login - Login with role or email
router.post('/login', (req: Request, res: Response) => {
  const { role, email } = req.body;
  const users = db.getUsers();

  let user = null;
  if (role) {
    user = users.find((u) => u.role.toLowerCase() === role.toLowerCase());
  } else if (email) {
    user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    user = users[0];
  }

  res.json({
    success: true,
    data: {
      user,
      token: user.id,
      expiresIn: '24h'
    }
  });
});

// GET /api/auth/me - Current user details
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const userId = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : 'usr-1';
  const user = db.getUserById(userId) || db.getUsers()[0];

  res.json({ success: true, data: user });
});

export default router;
