import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: 'User' },
  item:      { type: Schema.Types.ObjectId, ref: 'Inventory' },
  razorpayOrderId: { type: String, unique: true }, 
  status:    { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  amount:    Number
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);