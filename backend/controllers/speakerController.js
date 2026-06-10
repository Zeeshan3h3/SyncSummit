import Speaker from '../models/Speaker.js';

export const getSpeakers = async (req, res, next) => {
    try {
        const speakers = await Speaker.find().sort({ createdAt: -1 });
        res.json(speakers);
    } catch (err) {
        next(err);
    }
};

export const getSpeaker = async (req, res, next) => {
    try {
        const speaker = await Speaker.findById(req.params.id);
        if (!speaker) return res.status(404).json({ error: 'Speaker not found' });
        res.json(speaker);
    } catch (err) {
        next(err);
    }
};

export const createSpeaker = async (req, res, next) => {
    try {
        const { name, role, company, bio, featured } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        const newSpeaker = new Speaker({ name, role, company, bio, featured, image });
        const saved = await newSpeaker.save();
        res.status(201).json(saved);
    } catch (err) {
        next(err);
    }
};

export const updateSpeaker = async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (req.file) updateData.image = `/uploads/${req.file.filename}`;
        
        const updated = await Speaker.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Speaker not found' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const deleteSpeaker = async (req, res, next) => {
    try {
        const deleted = await Speaker.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Speaker not found' });
        res.json({ message: 'Speaker deleted successfully' });
    } catch (err) {
        next(err);
    }
};
