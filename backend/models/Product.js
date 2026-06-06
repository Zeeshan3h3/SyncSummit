import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  original_price: Number,
  stock: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  sizes: [{ label: String, available: Boolean }],
  description: [String],
  specifications: { type: Map, of: String },
  reviews: [{ name: String, date: String, rating: Number, text: String }],
  imageUrl: String,
  images: { type: Number, default: 1 } // frontend simulates images
}, { timestamps: true });

export default mongoose.model('Product', productSchema);