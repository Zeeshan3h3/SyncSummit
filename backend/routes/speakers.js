import express from 'express';
import { getSpeakers, getSpeaker, createSpeaker, updateSpeaker, deleteSpeaker } from '../controllers/speakerController.js';
import upload from '../middleware/upload.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSpeakers);
router.get('/:id', getSpeaker);

router.post('/', authenticate, authorize('superadmin', 'admin'), upload.single('image'), createSpeaker);
router.put('/:id', authenticate, authorize('superadmin', 'admin'), upload.single('image'), updateSpeaker);
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), deleteSpeaker);

export default router;
