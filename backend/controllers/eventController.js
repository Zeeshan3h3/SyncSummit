import Event from '../models/Event.js';

// GET all events (Public)
export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// GET a single event by ID (Public)
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// POST create a new event (Admin/Superadmin)
export const createEvent = async (req, res, next) => {
  try {
    // req.user.id comes from the authenticate middleware
    const newEvent = new Event({
      ...req.body,
      createdBy: req.user._id 
    });
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    next(err);
  }
};

// PUT update an event (Admin/Superadmin)
export const updateEvent = async (req, res, next) => {
  try {
    // { new: true } returns the updated document, runValidators ensures schema rules apply
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
    res.json(updatedEvent);
  } catch (err) {
    next(err);
  }
};

// DELETE an event (Superadmin only)
export const deleteEvent = async (req, res, next) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event successfully deleted' });
  } catch (err) {
    next(err);
  }
};