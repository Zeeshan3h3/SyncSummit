const eventSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  venue: String,
  startTime: Date,
  endTime: Date,
  speakers: [{ name: String, bio: String, topic: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });


export default mongoose.model('Events', eventSchema);