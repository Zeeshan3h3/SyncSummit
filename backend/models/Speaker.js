import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  image: { type: String },
  bio: { type: String },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Speaker', speakerSchema);
