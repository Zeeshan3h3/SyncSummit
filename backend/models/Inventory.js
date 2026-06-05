import mongoose from 'mongoose';
const { Schema } = mongoose;

const inventorySchema = new Schema({
  name: String, price: Number,
  quantity: { type: Number, default: 0, min: 0 },
  imageUrl: String
});

export default mongoose.model('Inventory', inventorySchema);