import mongoose from 'mongoose';
const { Schema } = mongoose;

const eventSchema = new Schema({
  name: { type: String, required: true },
  type: String, // 'HACKATHON', 'WORKSHOP', etc
  tagline: String,
  date: String,
  venue: String,
  prize_pool: String,
  capacity: Number,
  registered: { type: Number, default: 0 },
  status: { type: String, default: 'OPEN' }, // 'OPEN', 'CLOSING SOON', 'FULL'
  is_featured: { type: Boolean, default: false },
  team_size: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Events', eventSchema);