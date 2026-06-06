import express from 'express';
import { getAllUsers, changeUserRole, getFinancials, getSystemStats } from '../controllers/adminController.js'; 
import { authorize } from '../middleware/auth.js';
const router = express.Router();

router.get('/users', authorize('admin','superadmin'), getAllUsers);
router.patch('/users/:id/role', authorize('superadmin'), changeUserRole);
router.get('/financials', authorize('superadmin'), getFinancials);
router.get('/stats', authorize('superadmin'), getSystemStats);

router.post('/broadcast', authorize('admin','superadmin'),
  async (req, res) => {
  
    io.emit('schedule-update', { message: req.body.message });
    res.json({ sent: true });
  }
);

export default router; 
