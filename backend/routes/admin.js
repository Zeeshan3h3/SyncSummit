import express from 'express';
import {
  getAllUsers,
  changeUserRole,
  getFinancials,
  getSystemStats,
  getOrders,
  getEventRegistrations,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', authenticate, authorize('admin', 'superadmin'), getAllUsers);
router.patch('/users/:id/role', authenticate, authorize('superadmin'), changeUserRole);
router.get('/financials', authenticate, authorize('superadmin'), getFinancials);
router.get('/stats', authenticate, authorize('superadmin'), getSystemStats);

// Data export endpoints
router.get('/orders', authenticate, authorize('admin', 'superadmin'), getOrders);
router.get('/registrations/:eventId', authenticate, authorize('admin', 'superadmin'), getEventRegistrations);

export default router;
