import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { 
  getAllEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from '../controllers/eventController.js';


const router = express.Router();

router.get('/', getAllEvents);              // anyone
router.get('/:id', getEvent);             
router.post('/', authenticate, authorize('superadmin'), upload, createEvent);
router.put('/:id', authenticate, authorize('admin','superadmin'), upload, updateEvent);
router.delete('/:id', authenticate, authorize('superadmin'), deleteEvent);

export default router;
