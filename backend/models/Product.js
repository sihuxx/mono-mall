import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: 'TOPS' },
  imageUrl: { type: String, required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderName: { type: String, required: true },
}, { timestamps: true });

productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
