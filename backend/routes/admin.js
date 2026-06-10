import express from 'express';
import { getAllUsers, changeUserRole, getFinancials, getSystemStats } from '../controllers/adminController.js'; 
import { authenticate, authorize } from '../middleware/auth.js';
const router = express.Router();

router.get('/users', authenticate, authorize('admin','superadmin'), getAllUsers);
router.patch('/users/:id/role', authenticate, authorize('superadmin'), changeUserRole);
router.get('/financials', authenticate, authorize('superadmin'), getFinancials);
router.get('/stats', authenticate, authorize('superadmin'), getSystemStats);

router.post('/broadcast', authenticate, authorize('admin','superadmin'),
  async (req, res) => {
  
    io.emit('schedule-update', { message: req.body.message });
    res.json({ sent: true });
  }
);

export default router; 
