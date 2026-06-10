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

// POST create a new event (Admin/Superadmin only)
export const createEvent = async (req, res, next) => {
  try {
    const thumbnailPath = req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '';
    const imagesPaths = req.files && req.files['images'] ? req.files['images'].map(file => `/uploads/${file.filename}`) : [];

    const newEvent = new Event({
      ...req.body,
      thumbnail: thumbnailPath,
      images: imagesPaths,
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
    const updateData = { ...req.body };

    // Handle new file uploads if provided
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
      updateData.thumbnail = `/uploads/${req.files['thumbnail'][0].filename}`;
    }
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      updateData.images = req.files['images'].map(file => `/uploads/${file.filename}`);
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { 
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
