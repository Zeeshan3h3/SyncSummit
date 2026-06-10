import { Router } from 'express';
import Contact from '../models/Contact.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// @route   POST /api/contact
// @desc    Submit a contact form message
// @access  Public
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please provide all fields' });
    }

    const newContact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json(newContact);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Admin/Superadmin only
router.get('/', authenticate, authorize('admin', 'superadmin'), async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/contact/:id
// @desc    Update a contact message's status
// @access  Admin/Superadmin only
router.put('/:id', authenticate, authorize('admin', 'superadmin'), async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Superadmin only
router.delete('/:id', authenticate, authorize('superadmin'), async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
