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
  team_size: { type: String, default: 'Solo' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  description: String,
  imageUrl: String,
  price: Number,
  schedule: [{ time: String, activity: String, details: String }],
  prizes: [{ place: String, amount: String, description: String }],
  organizers: [{ name: String, role: String, initials: String }],
  sponsors: [{ name: String, tier: String }]
}, { timestamps: true });

export default mongoose.model('Events', eventSchema);