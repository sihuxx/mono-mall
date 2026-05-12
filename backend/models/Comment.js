import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  content: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

commentSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
