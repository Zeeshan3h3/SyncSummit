const inventorySchema = new Schema({
  name: String, price: Number,
  quantity: { type: Number, default: 0, min: 0 },
  // min:0 prevents going negative at DB level
  imageUrl: String
});

export default mongoose.model('Inventory', inventorySchema);