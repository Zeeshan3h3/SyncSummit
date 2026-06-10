import express from 'express';
import { getSpeakers, getSpeaker, createSpeaker, updateSpeaker, deleteSpeaker } from '../controllers/speakerController.js';
import upload from '../middleware/upload.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSpeakers);
router.get('/:id', getSpeaker);

router.post('/', verifyToken, verifyRole('superadmin', 'admin'), upload.single('image'), createSpeaker);
router.put('/:id', verifyToken, verifyRole('superadmin', 'admin'), upload.single('image'), updateSpeaker);
router.delete('/:id', verifyToken, verifyRole('superadmin', 'admin'), deleteSpeaker);

export default router;
