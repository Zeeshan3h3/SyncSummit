import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: 'User' },
  items:     [{ 
    productId: { type: String }, // Can be ObjectId if ref to Inventory, but storing as String for now based on mockup IDs (e.g. integer 1, 2, 3)
    name: String,
    quantity: Number,
    price: Number,
    size: String
  }],
  razorpayOrderId: { type: String, unique: true }, 
  status:    { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  amount:    Number
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);